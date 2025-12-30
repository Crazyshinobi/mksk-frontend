import { Table, Spin, Input, Button, Space } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useState } from 'react';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import Switch from '../../components/form/switch/Switch'; // Import your custom Switch
import { useCustomers, useDeleteCustomer, useToggleCustomerStatus } from '../../hooks/useCustomers'; // Import the toggle hook
import { useTheme } from '../../context/ThemeContext';

export default function ViewUser() {
  const { theme } = useTheme();
  const { data, isLoading, isError, error } = useCustomers();
  const { mutate: toggleStatus } = useToggleCustomerStatus(); // Initialize the mutation
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<any>>({});

  if (isError) {
    toast.error((error as any)?.response?.data?.message || 'Failed to load customers');
  }

  const handleChange = (
    _: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<any>);
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  // Helper for toggle action
  const handleToggleStatus = (id: number) => {
    toggleStatus(id);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete all uploaded documents.`)) {
      deleteCustomer(id);
    }
  };

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
        <Space className='mt-2'>
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
    onFilter: (value: any, record: any) =>
      record[dataIndex]?.toString().toLowerCase().includes((value as string).toLowerCase()),
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
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      fixed: 'left',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === 'fullName' ? sortedInfo.order : null,
      ...getColumnSearchProps('fullName', 'Name'),
    },
    {
      title: 'Role',
      key: 'role',
      filters: [
        { text: 'Borrower', value: 'isBorrower' },
        { text: 'Lender', value: 'isLender' },
      ],
      filteredValue: filteredInfo.role || null,
      onFilter: (value: any, record) => record[value] === true,
      render: (_, record) => (
        <div className="flex gap-1">
          {record.isBorrower && <Badge color="primary" variant='solid'>Borrower</Badge>}
          {record.isLender && <Badge color="primary" variant='light'>Lender</Badge>}
        </div>
      ),
    },
    {
      title: 'Company',
      dataIndex: ['company', 'companyName'],
      key: 'companyName',
      sorter: (a, b) => (a.company?.companyName || '').localeCompare(b.company?.companyName || ''),
      sortOrder: sortedInfo.columnKey === 'companyName' ? sortedInfo.order : null,
      render: (text) => text ? <Badge color="warning" variant="solid" size="md">{text}</Badge> : <span className="text-gray-400 italic">N/A</span>,
    },
    {
      title: 'Status',
      key: 'status_badge',
      render: (_, record) => (
        <div className="">
          <Switch
            checked={record.isActive}
            color="green-red"
            onChange={() => handleToggleStatus(record.id)}
          />
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150, // Slightly wider for two buttons
      render: (_, record) => (
        <Button
          type="text"
          size='large'
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id, record.fullName)}
        />

      ),
    },
  ];

  return (
    <>
      <PageMeta title="MKSK Admin Dashboard | View Users" description='View Users' />
      <PageBreadcrumb pageTitle="View Users" />

      <div className="space-y-6">
        <ComponentCard
          title="Users List"
          headerRight={
            <Button
              onClick={clearAll}
              icon={<ReloadOutlined />}
              className="flex items-center"
            >
              Reset Table
            </Button>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" tip="Loading Users..." />
            </div>
          ) : (
            <Table
              className={theme === 'dark' ? 'antd-dark-table' : ''}
              columns={columns}
              dataSource={data?.data || []}
              rowKey="id"
              scroll={{ x: 1300 }}
              onChange={handleChange}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} Users`
              }}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}