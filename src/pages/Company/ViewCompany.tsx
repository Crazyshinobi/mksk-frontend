import { Table, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import toast from 'react-hot-toast';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';

import { useCompanies } from '../../hooks/useCompanies';
import { Company } from '../../api/companies.api';
import { useTheme } from '../../context/ThemeContext';

export default function ViewCompany() {
  const { theme } = useTheme();
  const { data, isLoading, isError, error } = useCompanies();

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ||
      'Failed to load companies',
    );
  }

  const columns: ColumnsType<Company> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
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
      render: (date) =>
        new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageMeta title="MKSK Admin Dashboard | View Company" />
      <PageBreadcrumb pageTitle="View Company" />

      <div className="space-y-6">
        <ComponentCard title="View Company">
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
              pagination={{ pageSize: 10 }}
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
