const axios = require('axios');
const XLSX = require('xlsx');

class LarkService {
    constructor() {
        this.baseURL = 'https://open.larksuite.com/open-apis';
        this.timeout = parseInt(process.env.API_TIMEOUT) || 30000;

        // Cache cho Lark token
        this.cachedToken = null;

        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AILover-Proxy/1.0.0'
            }
        });

        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                console.log(`🔄 Forwarding ${config.method.toUpperCase()} request to: ${config.url}`);
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => {
                console.log(`✅ Response received: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                console.error('Response interceptor error:', error.response?.status, error.message);
                return Promise.reject(error);
            }
        );
    }
    async forwardGetRequest(endpoint, queryParams = {}) {
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const response = await this.axiosInstance.get(`/${cleanEndpoint}`, {
                params: queryParams
            });
            return response.data;
        } catch (error) {
            throw this.handleAxiosError(error);
        }
    }
    async forwardPostRequest(endpoint, body = {}, queryParams = {}) {
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const response = await this.axiosInstance.post(`/${cleanEndpoint}`, body, {
                params: queryParams
            });
            return response.data;
        } catch (error) {
            throw this.handleAxiosError(error);
        }
    }
    async forwardPutRequest(endpoint, body = {}, queryParams = {}) {
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const response = await this.axiosInstance.put(`/${cleanEndpoint}`, body, {
                params: queryParams
            });
            return response.data;
        } catch (error) {
            throw this.handleAxiosError(error);
        }
    }
    async forwardDeleteRequest(endpoint, queryParams = {}) {
        try {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            const response = await this.axiosInstance.delete(`/${cleanEndpoint}`, {
                params: queryParams
            });
            return response.data;
        } catch (error) {
            throw this.handleAxiosError(error);
        }
    }

    handleAxiosError(error) {
        if (error.response) {
            // Server responded with error status
            const customError = new Error(error.response.data?.message || error.message);
            customError.status = error.response.status;
            customError.data = error.response.data;
            return customError;
        } else if (error.request) {
            // Request was made but no response received
            const customError = new Error('No response received from target server');
            customError.status = 503;
            return customError;
        } else {
            // Something else happened
            const customError = new Error(error.message);
            customError.status = 500;
            return customError;
        }
    }

    // Method to update base URL dynamically
    updateBaseURL(newBaseURL) {
        this.baseURL = newBaseURL;
        this.axiosInstance.defaults.baseURL = newBaseURL;
        console.log(`🔄 Updated base URL to: ${newBaseURL}`);
    }

    // Method to add custom headers
    addHeaders(headers) {
        Object.assign(this.axiosInstance.defaults.headers, headers);
        console.log('🔄 Added custom headers:', headers);
    }
    async handleProxyLark(req, res) {
        try {
            // Lấy credentials từ environment hoặc sử dụng default values
            const app_id = process.env.LARK_APP_ID || 'cli_a8c915c87e78d029';
            const app_secret = process.env.LARK_APP_SECRET || 'D0yyvfvGTO33juMTUPoZcdwSUnvFHSMo';

            console.log(`🔑 Requesting Lark token with app_id: ${app_id}`);
            console.log(`🔐 Using app_secret: ${app_secret.substring(0, 8)}...`);

            // Gọi API Lark để lấy tenant access token
            const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
                app_id,
                app_secret
            });

            console.log('✅ Lark token response:', response.data);

            // Trả về response với format consistent
            return {
                success: true,
                data: response.data,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Lark token request failed:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            throw this.handleAxiosError(error);
        }
    }

    // Method để lấy token và cache nó
    async getLarkToken() {
        try {
            const app_id = process.env.LARK_APP_ID || 'cli_a8c915c87e78d029';
            const app_secret = process.env.LARK_APP_SECRET || 'D0yyvfvGTO33juMTUPoZcdwSUnvFHSMo';

            const response = await this.axiosInstance.post('/auth/v3/tenant_access_token/internal', {
                app_id,
                app_secret
            });

            if (response.data && response.data.tenant_access_token) {
                // Cache token với thời gian expire
                this.cachedToken = {
                    token: response.data.tenant_access_token,
                    expires_at: Date.now() + (response.data.expire * 1000 - 60000) // Trừ 1 phút để an toàn
                };

                console.log('🎯 Cached Lark token successfully');
                return response.data.tenant_access_token;
            }

            throw new Error('Invalid token response from Lark API');
        } catch (error) {
            console.error('❌ Failed to get Lark token:', error.message);
            throw this.handleAxiosError(error);
        }
    }

    // Method để lấy token từ cache hoặc request mới
    async getValidLarkToken() {
        // Kiểm tra cache token
        if (this.cachedToken && this.cachedToken.expires_at > Date.now()) {
            console.log('🔄 Using cached Lark token');
            return this.cachedToken.token;
        }

        console.log('🔄 Requesting new Lark token');
        return await this.getLarkToken();
    }

    // Method để gọi Lark API với token
    async callLarkAPI(endpoint, method = 'GET', data = null, useToken = true) {
        try {
            let headers = {
                'Content-Type': 'application/json'
            };

            // Thêm token vào header nếu cần
            if (useToken) {
                const token = await this.getValidLarkToken();
                headers['Authorization'] = `Bearer ${token}`;
            }

            const config = {
                method,
                url: endpoint,
                headers,
                timeout: this.timeout
            };

            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = data;
            }

            const response = await this.axiosInstance(config);
            return response.data;

        } catch (error) {
            console.error(`❌ Lark API call failed [${method} ${endpoint}]:`, error.message);
            throw this.handleAxiosError(error);
        }
    }

    async getLarkDocument(documentId) {
        try {
            const token = await this.getLarkToken();
            const endpoint = `/docx/v1/documents/${documentId}/raw_content?lang=1`;
            console.log(`🔄 Fetching Lark document with ID: ${documentId}`);

            const { data } = await this.axiosInstance.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return data?.data?.content || '';
        } catch (error) {
            console.error(`❌ Failed to get Lark document [${documentId}]:`, error.message);
            throw this.handleAxiosError(error);
        }
    }

    convertDataToCSVBuffer(testCaseData) {
        try {
            if (!Array.isArray(testCaseData) || testCaseData.length === 0) {
                throw new Error('Test case data must be a non-empty array');
            }

            // Lấy headers từ object đầu tiên
            const headers = Object.keys(testCaseData[0])?.filter(item => !['check_list_id', 'test_suit_id'].includes(item));

            // Tạo CSV content
            let csvContent = headers.join(',') + '\n';

            // Thêm từng row data
            testCaseData.forEach((item, index) => {
                const row = headers.map((header) => {
                    if (!['check_list_id', 'test_suit_id'].includes(header)) {
                        const value = item[header];
                        if (header === 'id') {
                            return index + 1;
                        }
    
                        // Escape commas and quotes trong CSV
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }

                        if (header === 'steps') {
                            const stepsText = value?.map(s => 
                                `Step ${s?.step?.toString()?.replace(',', ' ') || ''}: - ` +
                                `Action: ${s?.action?.toString()?.replace(',', ' ')  || ''} - ` +
                                `Expected: ${s?.expected?.toString()?.replace(',', ' ')  || ''} - ` +
                                `Test Data: ${s?.testData?.toString()?.replace(',', ' ')  || ''} - ` +
                                `Status: ${s?.status?.toString()?.replace(',', ' ')  || ''}`
                            ).join(' --- ');

                            return stepsText || '';
                        }

                        if (header === 'status') {
                            return value || ''
                        }

                        return value || '';
                    }
                }).join(',');
                csvContent += row + '\n';
            });

            // Convert to buffer và sau đó thành array of bytes
            const buffer = Buffer.from(csvContent, 'utf8');
            return Array.from(buffer);

        } catch (error) {
            console.error('❌ Failed to convert data to CSV buffer:', error.message);
            throw error;
        }
    }

    async importSheet(data) {
        try {
            const token = await this.getLarkToken();
            const endpoint = '/sheets/v2/import';
            console.log('🔄 Importing data to Lark sheet...');

            const response = await this.axiosInstance.post(
                endpoint,
                {
                    file: data,
                    name: `Test case ${new Date().toLocaleString()}.csv`,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Data imported successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Failed to import sheet:', error.message);
            throw this.handleAxiosError(error);

        }

    }

    async getFileUrlImport(ticket) {
        try {
            const token = await this.getLarkToken();
            const endpoint = `/sheets/v2/import/result?ticket=${ticket}`;
            console.log('🔄 Getting file URL for import...');

            const response = await this.axiosInstance.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ File URL retrieved successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Failed to get file URL for import:', error.message);
            throw this.handleAxiosError(error);
        }
    }

    async exportTestCase(testCaseData) {
        try {
            console.log('🚀 Exporting test case to Lark sheet...');

            // Convert test case data to xlsx format
            const csvBuffer = this.convertDataToCSVBuffer(testCaseData);
            console.log('🔄 Converting test case data to CSV buffer...', csvBuffer);


            const { data } = await this.importSheet(csvBuffer);
            console.log('✅ Test case data imported successfully:', data);

            let fileUrl = '';
            while (!fileUrl) {
                // Lấy file URL từ ticket
                const getFileUrlResponse = await this.getFileUrlImport(data.ticket);
                console.log('🔄 Getting file URL for imported data:', getFileUrlResponse);

                if (getFileUrlResponse && getFileUrlResponse?.data?.url) {
                    fileUrl = getFileUrlResponse?.data?.url;
                } else {
                    console.log('⏳ Waiting for file URL to be available...');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây trước khi thử lại
                }
            }

            console.log('✅ File URL for imported data:', fileUrl);

            return fileUrl;
        } catch (error) {
            console.error('❌ Failed to export test case:', error.message);
            throw this.handleAxiosError(error);
        }
    }

    formatTestReportToBlocks(testReportData) {
        try {
            const children = [];

            // Block 1: Summary
            children.push({
                block_type: 2, // Text block
                text: {
                    elements: [
                        {
                            text_run: {
                                content: "Test Summary:\n",
                                text_element_style: {
                                    bold: true,
                                    text_color: 1 // Black
                                }
                            }
                        },
                        {
                            text_run: {
                                content: testReportData.summary,
                                text_element_style: {
                                    text_color: 1
                                }
                            }
                        }
                    ],
                    // style: {}
                }
            });

            // Block 2: Execution Statistics
            const executionStats = `Execution Statistics:
                • Total Test Cases: ${testReportData.totalTestCases}
                • Executed Test Cases: ${testReportData.executedTestCases}
                • Execution Progress: ${testReportData.executionProgressPercentage}%

                Status Breakdown:
                • PASS: ${testReportData.statusBreakdown.PASS.count} (${testReportData.statusBreakdown.PASS.percentage}%)
                • FAIL: ${testReportData.statusBreakdown.FAIL.count} (${testReportData.statusBreakdown.FAIL.percentage}%)
                • PENDING: ${testReportData.statusBreakdown.PENDING.count} (${testReportData.statusBreakdown.PENDING.percentage}%)
            `;

            children.push({
                block_type: 2,
                text: {
                    elements: [
                        {
                            text_run: {
                                content: "Execution Statistics:\n",
                                text_element_style: {
                                    bold: true,
                                    text_color: 1
                                }
                            }
                        },
                        {
                            text_run: {
                                content: `• Total Test Cases: ${testReportData.totalTestCases}\n• Executed Test Cases: ${testReportData.executedTestCases}\n• Execution Progress: ${testReportData.executionProgressPercentage}%\n\n`,
                                text_element_style: {
                                    text_color: 1
                                }
                            }
                        },
                        {
                            text_run: {
                                content: "Status Breakdown:\n",
                                text_element_style: {
                                    bold: true,
                                    text_color: 1
                                }
                            }
                        },
                        {
                            text_run: {
                                content: `• PASS: ${testReportData.statusBreakdown.PASS.count} (${testReportData.statusBreakdown.PASS.percentage}%)\n`,
                                text_element_style: {
                                    text_color: 3, // Green for PASS
                                    bold: false
                                }
                            }
                        },
                        {
                            text_run: {
                                content: `• FAIL: ${testReportData.statusBreakdown.FAIL.count} (${testReportData.statusBreakdown.FAIL.percentage}%)\n`,
                                text_element_style: {
                                    text_color: 2, // Red for FAIL
                                    bold: false
                                }
                            }
                        },
                        {
                            text_run: {
                                content: `• PENDING: ${testReportData.statusBreakdown.PENDING.count} (${testReportData.statusBreakdown.PENDING.percentage}%)`,
                                text_element_style: {
                                    text_color: 6, // Orange for PENDING
                                    bold: false
                                }
                            }
                        }
                    ],
                    style: {}
                }
            });

            // Block 3: Risk Analysis
            if (testReportData.riskAnalysis) {
                children.push({
                    block_type: 2,
                    text: {
                        elements: [
                            {
                                text_run: {
                                    content: "Risk Analysis:\n",
                                    text_element_style: {
                                        bold: true,
                                        text_color: 1,
                                        background_color: 13 // Light yellow background
                                    }
                                }
                            },
                            {
                                text_run: {
                                    content: testReportData.riskAnalysis.overview,
                                    text_element_style: {
                                        text_color: 1
                                    }
                                }
                            }
                        ],
                        style: {}
                    }
                });

                // Key Failures Block
                if (testReportData.riskAnalysis.keyFailures && testReportData.riskAnalysis.keyFailures.length > 0) {
                    const failuresElements = [
                        {
                            text_run: {
                                content: "Key Failures:\n",
                                text_element_style: {
                                    bold: true,
                                    text_color: 2, // Red
                                    background_color: 16 // Light red background
                                }
                            }
                        }
                    ];

                    testReportData.riskAnalysis.keyFailures.forEach(failure => {
                        failuresElements.push({
                            text_run: {
                                content: `• [${failure.priority}] ID ${failure.id}: ${failure.content}\n`,
                                text_element_style: {
                                    text_color: 1,
                                    bold: failure.priority === 'C' // Bold for Critical
                                }
                            }
                        });
                    });

                    children.push({
                        block_type: 2,
                        text: {
                            elements: failuresElements,
                            style: {}
                        }
                    });
                }

                // Key Pending High/Critical Block
                if (testReportData.riskAnalysis.keyPendingHighCritical && testReportData.riskAnalysis.keyPendingHighCritical.length > 0) {
                    const pendingElements = [
                        {
                            text_run: {
                                content: "Key Pending High/Critical Cases:\n",
                                text_element_style: {
                                    bold: true,
                                    text_color: 6, // Orange
                                    background_color: 15 // Light orange background
                                }
                            }
                        }
                    ];

                    testReportData.riskAnalysis.keyPendingHighCritical.forEach(pending => {
                        pendingElements.push({
                            text_run: {
                                content: `• [${pending.priority}] ID ${pending.id}: ${pending.content}\n`,
                                text_element_style: {
                                    text_color: 1,
                                    bold: pending.priority === 'C' // Bold for Critical
                                }
                            }
                        });
                    });

                    children.push({
                        block_type: 2,
                        text: {
                            elements: pendingElements,
                            style: {}
                        }
                    });
                }
            }

            // Block 4: Recommendations
            if (testReportData.recommendations && testReportData.recommendations.length > 0) {
                const recommendationsElements = [
                    {
                        text_run: {
                            content: "Recommendations:\n",
                            text_element_style: {
                                bold: true,
                                text_color: 1,
                                background_color: 14 // Light blue background
                            }
                        }
                    }
                ];

                testReportData.recommendations.forEach((rec, index) => {
                    recommendationsElements.push({
                        text_run: {
                            content: `${index + 1}. ${rec}\n\n`,
                            text_element_style: {
                                text_color: 1,
                                bold: false
                            }
                        }
                    });
                });

                children.push({
                    block_type: 2,
                    text: {
                        elements: recommendationsElements,
                        style: {}
                    }
                });
            }

            // Return in the format expected by Lark API
            return {
                index: 0,
                children: children
            };

        } catch (error) {
            console.error('❌ Failed to format test report to blocks:', error.message);
            throw error;
        }
    }

    async createLarkDocument(title) {
        try {
            const token = await this.getLarkToken();
            const endpoint = '/docx/v1/documents';

            console.log('🔄 Creating Lark document...');

            const response = await this.axiosInstance.post(endpoint, {
                title: title,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Lark document created successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Failed to create Lark document:', error.message);
            throw this.handleAxiosError(error);
        }
    }

    async generateDocumentContent(documentId, blocks) {
        try {
            const token = await this.getLarkToken();
            const endpoint = `/docx/v1/documents/${documentId}/blocks/${documentId}/children`;
            const response = await this.axiosInstance.post(endpoint, {
                ...blocks,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Document content generated successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Failed to generate document content:', error);
            throw this.handleAxiosError(error);
        }
    }

    async exportTestReport(testReportData) {
        try {
            const currentDate = new Date().toLocaleString();
            const title = `Test Report - ${currentDate}`;
            console.log(`📝 Creating test report document: "${title}"`);

            // Format test report data to Lark document blocks
            const blocks = this.formatTestReportToBlocks(testReportData);
            const { data: larkDocument } = await this.createLarkDocument(title);

            if (larkDocument?.document?.document_id) {
                console.log(`📄 Created Lark document with ID: ${larkDocument.document.document_id}`);

                const documentId = larkDocument.document.document_id;
                const { data: contentResponse } = await this.generateDocumentContent(documentId, blocks);
                if (contentResponse?.client_token) {
                    return `https://qsgekjhfr3py.sg.larksuite.com/docx/${documentId}`;
                }
            }
        } catch (error) {
            console.error('❌ Failed to export test report:', error.message);
            throw this.handleAxiosError(error);
        }

    }
}

module.exports = new LarkService();
