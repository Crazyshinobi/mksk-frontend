import { useState, useMemo } from 'react';
import { Table, Tag, DatePicker, Select, Space, Button, Row, Col, Typography } from 'antd';
import { ReloadOutlined, FilterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { useCashbook } from '../../hooks/useTransactions';
import { useCompanies } from '../../hooks/useCompanies';
import type { CashbookEntry } from '../../api/transactions.api';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function Cashbook() {
    const navigate = useNavigate();

    // State for filters
    const [companyId, setCompanyId] = useState<number | undefined>(undefined);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

    // Prepare params - Memoized to prevent unnecessary re-renders
    const params = useMemo(() => {
        const p: any = {};
        if (companyId) p.companyId = companyId;
        if (dateRange?.[0]) p.startDate = dateRange[0].format('YYYY-MM-DD');
        if (dateRange?.[1]) p.endDate = dateRange[1].format('YYYY-MM-DD');
        return p;
    }, [companyId, dateRange]);

    // Data Fetching
    const { data: cashbookResponse, isLoading, isError, refetch } = useCashbook(params);
    const { data: companiesResponse } = useCompanies();

    // Extract data arrays with proper type safety
    const cashbookData: CashbookEntry[] = useMemo(() => {
        if (!cashbookResponse?.data?.data) return [];
        return Array.isArray(cashbookResponse.data.data) ? cashbookResponse.data.data : [];
    }, [cashbookResponse]);

    const companiesData = useMemo(() => {
        if (!companiesResponse?.data) return [];
        return Array.isArray(companiesResponse.data) ? companiesResponse.data : [];
    }, [companiesResponse]);

    // Handlers
    const handleReset = () => {
        setCompanyId(undefined);
        setDateRange(null);
    };

    // Table Columns
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString('en-GB'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => <Text strong className="uppercase">{text}</Text>
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            width: 120,
            render: (ref: string) => <Tag color="blue" className="font-mono">{ref}</Tag>
        },
        {
            title: 'Receiving (+)',
            dataIndex: 'receiving',
            key: 'receiving',
            width: 150,
            align: 'right' as const,
            className: 'text-green-600 font-bold',
            render: (val: number | '-') => {
                if (val === '-') return '-';
                return `₹${Number(val).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            },
        },
        {
            title: 'Deduction (-)',
            dataIndex: 'deduction',
            key: 'deduction',
            width: 150,
            align: 'right' as const,
            className: 'text-red-600 font-bold',
            render: (val: number | '-') => {
                if (val === '-') return '-';
                return `₹${Number(val).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            },
        },
        {
            title: 'Running Balance',
            dataIndex: 'balance',
            key: 'balance',
            width: 180,
            align: 'right' as const,
            className: 'bg-gray-50 font-black',
            render: (val: number) => (
                <span className={val >= 0 ? 'text-green-700' : 'text-red-700'}>
                    ₹{Number(val).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </span>
            ),
        },
    ];

    if (isError) {
        return (
            <>
                <PageMeta title="MKSK | Cashbook Ledger" description="View all company transactions and running balance" />
                <PageBreadcrumb pageTitle="Cashbook Ledger" />
                <div className="p-10 text-center">
                    <Text type="danger" strong className="block mb-4 text-lg">
                        Failed to load cashbook data. Please try again.
                    </Text>
                    <Button onClick={() => refetch()} icon={<ReloadOutlined />} type="primary">
                        Retry Connection
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <PageMeta title="MKSK | Cashbook Ledger" description="View all company transactions and running balance" />
            <PageBreadcrumb pageTitle="Cashbook Ledger" />

            <div className="mb-6 flex justify-between items-center no-print">
                <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
                    Back
                </Button>
                <Button type="primary" onClick={() => window.print()} className="bg-blue-600">
                    Print Ledger
                </Button>
            </div>

            <ComponentCard title="Company Passbook">
                {/* Filters Section */}
                <div className="mb-6 p-5 bg-white border border-gray-100 rounded-xl shadow-sm no-print">
                    <Row gutter={[16, 16]} align="bottom">
                        <Col xs={24} sm={12} lg={8}>
                            <Text className="block mb-2 font-semibold text-gray-600">
                                Filter by Company
                            </Text>
                            <Select
                                placeholder="All Companies"
                                allowClear
                                showSearch
                                className="w-full"
                                value={companyId}
                                onChange={(value) => setCompanyId(value)}
                                options={companiesData.map((c) => ({
                                    value: c.id,
                                    label: c.companyName,
                                }))}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Text className="block mb-2 font-semibold text-gray-600">
                                Select Date Range
                            </Text>
                            <RangePicker
                                className="w-full"
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                                format="DD/MM/YYYY"
                                placeholder={['Start Date', 'End Date']}
                            />
                        </Col>

                        <Col xs={24} lg={8}>
                            <Space className="w-full justify-end">
                                <Button
                                    onClick={handleReset}
                                    icon={<ReloadOutlined />}
                                    disabled={!companyId && !dateRange}
                                >
                                    Reset Filters
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => refetch()}
                                    icon={<FilterOutlined />}
                                    loading={isLoading}
                                >
                                    Apply Filters
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Ledger Table */}
                <Table
                    dataSource={cashbookData}
                    columns={columns}
                    loading={isLoading}
                    rowKey="id"
                    scroll={{ x: 1000 }}
                    pagination={{
                        pageSize: 15,
                        showTotal: (total) => `Total ${total} entries`,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '15', '25', '50', '100']
                    }}
                    bordered
                    locale={{
                        emptyText: isLoading ? 'Loading...' : 'No transactions found'
                    }}
                    summary={(pageData) => {
                        if (pageData.length === 0) return null;

                        let totalRec = 0;
                        let totalDed = 0;
                        let lastBal = 0;

                        pageData.forEach(({ receiving, deduction, balance }) => {
                            totalRec += receiving !== '-' ? Number(receiving) : 0;
                            totalDed += deduction !== '-' ? Number(deduction) : 0;
                            lastBal = Number(balance);
                        });

                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row className="bg-gray-50 font-black text-lg">
                                    <Table.Summary.Cell index={0} colSpan={3} className="text-center">
                                        PAGE TOTALS
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} className="text-right text-green-600">
                                        ₹{totalRec.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} className="text-right text-red-600">
                                        ₹{totalDed.toLocaleString('en-IN', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} className="text-right">
                                        <Text className={lastBal >= 0 ? 'text-green-700' : 'text-red-700'}>
                                            ₹{lastBal.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </ComponentCard>

            <style>{`
                @media print {
                    .no-print, 
                    .ant-pagination, 
                    .ant-btn, 
                    .ant-select, 
                    .ant-picker { 
                        display: none !important; 
                    }
                    .ant-table-wrapper { 
                        width: 100% !important; 
                        margin: 0 !important; 
                    }
                    body { 
                        background: white !important; 
                        padding: 10mm; 
                    }
                    table { 
                        page-break-inside: auto; 
                    }
                    tr { 
                        page-break-inside: avoid; 
                        page-break-after: auto; 
                    }
                }
            `}</style>
        </>
    );
}