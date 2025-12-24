import { Table, Spin, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import toast from 'react-hot-toast';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Badge from '../../components/ui/badge/Badge';
import { useCustomers } from '../../hooks/useCustomers';
import { useTheme } from '../../context/ThemeContext';
import Badges from '../UiElements/Badges';

export default function ViewUser() {
  const { theme } = useTheme();
  const { data, isLoading, isError, error } = useCustomers();

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message || 'Failed to load customers'
    );
  }

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      fixed: 'left'
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, record) => (
        <div className="flex gap-1">
          {record.isBorrower && <Badge color="primary" variant='solid'>Borrower</Badge>}
          {record.isLender && <Badge color="primary" variant='light'>Lender</Badge>}
        </div>
      ),
    },
    {
      title: 'Borrower Group',
      dataIndex: 'borrowerGroup',
      key: 'borrowerGroup',
    },

    {
      title: 'Lender Group',
      dataIndex: 'lenderGroup',
      key: 'lenderGroup',
    },
    {
      title: 'Email',
      dataIndex: 'emailAddress',
      key: 'emailAddress'
    },
    {
      title: 'Mobile',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber'
    },
    {
      title: 'Company',
      dataIndex: ['company', 'companyName'],
      key: 'companyName',
      render: (text) => (
        text ? (
          <Badge color="warning" variant="solid" size="md">
            {text}
          </Badge>
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        )
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (_, record) => (
        <div className="flex gap-1">
          {record.isActive ?
            <Badge color="success" variant='solid'>Active</Badge> :
            <Tag color="error" variant='solid'>Inactive</Tag>
          }
        </div>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <>
      <PageMeta title="MKSK Admin Dashboard | View Users" />
      <PageBreadcrumb pageTitle="View Users" />

      <div className="space-y-6">
        <ComponentCard title="Users List">
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
              scroll={{ x: 1000 }} // Enable horizontal scroll for many columns
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} Users`
              }}
              locale={{
                emptyText: <Empty description="No Users found" />,
              }}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}