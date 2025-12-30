import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Space, Spin, Empty, Tooltip } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
    // EyeOutlined,
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
    ReloadOutlined,
    // FileTextOutlined
} from '@ant-design/icons';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import { useTheme } from '../../context/ThemeContext';

export default function ViewTransactions() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // API Hooks
    const { data: transactions, isLoading } = useTransactions();
    const { mutate: deleteTransaction } = useDeleteTransaction();

    // Table State for Reset/Controlled Logic
    const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
    const [sortedInfo, setSortedInfo] = useState<SorterResult<any>>({});

    // 🔹 Reset Logic
    const handleReset = () => {
        setFilteredInfo({});
        setSortedInfo({});
    };

    const handleChange = (
        _: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<any> | SorterResult<any>[]
    ) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter as SorterResult<any>);
    };

    // 🔹 Action Handlers
    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction(id);
        }
    };

    const handleViewSlip = (id: number, type: 'lender' | 'borrower') => {
        navigate(`/view-slips/${id}?type=${type}`);
    };

    // 🔹 Search Filter Helper
    const getColumnSearchProps = (dataIndex: string, title: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    placeholder={`Search ${title}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    className="mb-2 block"
                />
                <Space>
                    <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" className="w-20">
                        Search
                    </Button>
                    <Button onClick={() => clearFilters && clearFilters()} size="small" className="w-20">
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        filteredValue: filteredInfo[dataIndex] || null,
        onFilter: (value: any, record: any) => {
            const val = dataIndex.includes('.')
                ? dataIndex.split('.').reduce((obj, key) => obj?.[key], record)
                : record[dataIndex];
            return val?.toString().toLowerCase().includes((value as string).toLowerCase());
        }
    });

    const columns: ColumnsType<any> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
            sortOrder: sortedInfo.columnKey === 'id' ? sortedInfo.order : null,
        },
        {
            title: 'Company',
            dataIndex: ['company', 'companyName'],
            key: 'companyName',
            sorter: (a, b) => (a.company?.companyName || '').localeCompare(b.company?.companyName || ''),
            sortOrder: sortedInfo.columnKey === 'companyName' ? sortedInfo.order : null,
            ...getColumnSearchProps('company.companyName', 'Company'),
            render: (text) => <span className="font-medium text-gray-700 dark:text-gray-300">{text || 'N/A'}</span>
        },
        {
            title: 'Lenders',
            key: 'lenders',
            width: 200,
            render: (_, record) => (
                <div className="flex flex-wrap gap-1">
                    {record.lenders?.length > 0 ? (
                        record.lenders.map((lender: any) => (
                            <span key={lender.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                {lender.fullName}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 italic text-xs">No Lenders</span>
                    )}
                </div>
            ),
        },
        // 🔹 BORROWERS COLUMN
        {
            title: 'Borrowers',
            key: 'borrowers',
            width: 200,
            render: (_, record) => (
                <div className="flex flex-wrap gap-1">
                    {record.borrowers?.length > 0 ? (
                        record.borrowers.map((borrower: any) => (
                            <span key={borrower.id} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                {borrower.fullName}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 italic text-xs">No Borrowers</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Type S/M',
            key: 'type',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-bold text-brand-500">{record.transaction_type}</span>
                    <span className="text-xs text-gray-400">Months: {record.transaction_number_type}</span>
                </div>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'transaction_date',
            key: 'transaction_date',
            sorter: (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime(),
            sortOrder: sortedInfo.columnKey === 'transaction_date' ? sortedInfo.order : null,
            render: (date) => new Date(date).toLocaleDateString('en-GB'),
        },
        {
            title: 'Amount (k)',
            dataIndex: 'amount_in_thousands',
            key: 'amount_in_thousands',
            sorter: (a, b) => a.amount_in_thousands - b.amount_in_thousands,
            sortOrder: sortedInfo.columnKey === 'amount_in_thousands' ? sortedInfo.order : null,
            render: (amt) => <span className="font-semibold text-gray-900 dark:text-white">₹{amt}k</span>
        },
        {
            title: 'Status',
            dataIndex: 'a_p_status',
            key: 'a_p_status',
            filters: [
                { text: 'Advanced', value: 'advanced' },
                { text: 'Past', value: 'past' },
            ],
            filteredValue: filteredInfo.a_p_status || null,
            onFilter: (value, record) => record.a_p_status === value,
            render: (status) => (
                <Badge color={status === 'advanced' ? 'success' : 'warning'}>
                    {status.toUpperCase()}
                </Badge>
            ),
        },
        {
            title: 'Slips',
            key: 'slips',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Lender Slip">
                        <Button
                            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 px-2 py-1 h-auto text-xs font-bold"
                            onClick={() => handleViewSlip(record.id, 'lender')}
                        >
                            L-SLIP
                        </Button>
                    </Tooltip>
                    <Tooltip title="View Borrower Slip">
                        <Button
                            className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 px-2 py-1 h-auto text-xs font-bold"
                            onClick={() => handleViewSlip(record.id, 'borrower')}
                        >
                            B-SLIP
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            className="text-blue-500 border-blue-100 p-2"
                            onClick={() => navigate(`/edit-transaction/${record.id}`)}
                        >
                            <EditOutlined />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            className="text-red-500 border-red-100 p-2"
                            onClick={() => handleDelete(record.id)}
                        >
                            <DeleteOutlined />
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <PageMeta title="MKSK | View Transactions" description="List of all transactions" />
            <PageBreadcrumb pageTitle="Transactions" />

            <div className="space-y-6">
                <ComponentCard
                    title="Transaction Registry"
                    headerRight={
                        <Button
                            onClick={handleReset}
                            icon={<ReloadOutlined />}
                            className="flex items-center gap-2"
                        >
                            Reset Table
                        </Button>
                    }
                >
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" tip="Fetching transactions..." />
                        </div>
                    ) : (
                        <Table
                            className={theme === 'dark' ? 'antd-dark-table' : ''}
                            columns={columns}
                            dataSource={transactions?.data || []}
                            rowKey="id"
                            scroll={{ x: 1300 }}
                            onChange={handleChange}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} transactions`
                            }}
                            locale={{
                                emptyText: <Empty description="No transactions found" />,
                            }}
                        />
                    )}
                </ComponentCard>
            </div>
        </>
    );
}