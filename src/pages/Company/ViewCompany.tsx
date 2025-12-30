import { Table, Spin, Empty, Input, Button, Space } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useState } from 'react';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';

import { useCompanies } from '../../hooks/useCompanies';
import { Company } from '../../api/companies.api';
import { useTheme } from '../../context/ThemeContext';

export default function ViewCompany() {
  const { theme } = useTheme();
  const { data, isLoading, isError, error } = useCompanies();

  // State for controlled filtering and sorting
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Company>>({});

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message || 'Failed to load companies',
    );
  }

  // Handle table changes
  const handleChange = (
    _: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Company> | SorterResult<Company>[]
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<Company>);
  };

  // One-click reset function
  const resetAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const columns: ColumnsType<Company> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === 'id' ? sortedInfo.order : null,
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
      sortOrder: sortedInfo.columnKey === 'companyName' ? sortedInfo.order : null,

      // Controlled Filtering
      filteredValue: filteredInfo.companyName || null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2" onKeyDown={(e) => e.stopPropagation()}>
          <Input
            placeholder="Search company"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            className="mb-2 block"
          />
          <Space className='mt-2'>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              className="w-20"
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && clearFilters()}
              size="small"
              className="w-20"
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record.companyName.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: 'Description',
      dataIndex: 'companyDesc',
      key: 'companyDesc',
      render: (text) => text || '-',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageMeta title="MKSK Admin Dashboard | View Company" description="View Company" />
      <PageBreadcrumb pageTitle="View Company" />

      <div className="space-y-6">
        <ComponentCard
          title="View Company List"
          headerRight={
            <Button
              onClick={resetAll}
              icon={<ReloadOutlined />}
              size="small"
              className="flex items-center"
            >
              Reset Table
            </Button>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              className={theme === 'dark' ? 'antd-dark-table' : ''}
              columns={columns}
              dataSource={data?.data || []}
              rowKey="id"
              onChange={handleChange} // Listen for changes to keep state in sync
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} companies`
              }}
              locale={{
                emptyText: <Empty description="No companies found" />,
              }}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}