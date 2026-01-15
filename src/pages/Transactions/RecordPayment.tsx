import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Select, Button, Typography, Space, Row, Col, Table, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { usePaymentAllocation } from '../../hooks/usePaymentAllocation';
import { useTransactionSlip } from '../../hooks/useTransactions';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';

const { Text } = Typography;

export default function RecordPayment() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const slipType = (searchParams.get('type') as 'lender' | 'borrower') || 'lender';

    const { data: slipResponse, isLoading } = useTransactionSlip(Number(id), slipType);
    const { mutateAllocation, isAllocating } = usePaymentAllocation();

    const [formData, setFormData] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        payment_amount: '',
        payment_method: 'bank',
        bank_name: '',
        reference_number: '',
        remarks: '',
    });

    const [rowAllocations, setRowAllocations] = useState<Record<number, string>>({});

    const slipData = slipResponse?.data;
    const transactions = slipData?.rows || [];

    // Helper to format currency and handle the "K" conversion
    const formatKCurrency = (val: any) => {
        const num = (Number(val) || 0) * 1000; // Multiply by 1000 as requested
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalAllocated = useMemo(() => {
        return Object.values(rowAllocations).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    }, [rowAllocations]);

    const handleAmountChange = (index: number, value: string) => {
        setRowAllocations(prev => ({ ...prev, [index]: value }));
    };

    const handleSubmit = () => {
        mutateAllocation({
            payment_id: 1,
            to_slip_id: Number(id),
            allocated_amount: totalAllocated,
            allocation_type: 'direct',
            remarks: formData.remarks
        }, {
            onSuccess: () => navigate(-1)
        });
    };

    const columns = [
        {
            title: 'Trans #',
            key: 'index',
            render: (_: any, __: any, index: number) => `#${index + 1}`
        },
        {
            title: 'Party Name',
            dataIndex: 'partyName',
            key: 'partyName',
            render: (text: string) => <Text strong className="uppercase">{text}</Text>
        },
        { title: 'Date', dataIndex: 'date', key: 'date', render: (d: string) => d || 'N/A' },
        {
            title: 'Principal',
            dataIndex: 'cash',
            key: 'cash',
            render: (val: any) => formatKCurrency(val)
        },
        {
            title: 'Interest',
            dataIndex: 'amt',
            key: 'amt',
            render: (val: any) => formatKCurrency(val)
        },
        {
            title: 'Paid',
            dataIndex: 'paid',
            key: 'paid',
            render: (val: any) => formatKCurrency(val)
        },
        {
            title: 'Pending',
            dataIndex: 'amt',
            key: 'pending',
            render: (val: any) => <Text type="danger" strong>{formatKCurrency(val)}</Text>
        },
        {
            title: 'Pay Amount',
            key: 'payAmount',
            render: (_: any, __: any, index: number) => (
                <Input
                    prefix="₹"
                    placeholder="0.00"
                    value={rowAllocations[index] || ''}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    style={{ width: 140 }}
                />
            )
        },
    ];

    if (isLoading) return <div className="p-20 text-center"><Spin size="large" /></div>;

    return (
        <>
            <PageBreadcrumb pageTitle="Record Payment" />
            <div className="space-y-6">
                <ComponentCard
                    title="RECORD PAYMENT"
                    headerRight={<Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Back to Slips</Button>}
                >
                    {/* Header Summary Bar with K conversion */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 mb-6 rounded-lg bg-cyan-50 border border-cyan-100">
                        <div>
                            <Text type="secondary" className="text-xs uppercase">Slip Number:</Text><br />
                            <Text strong className="text-cyan-700">{slipData?.header?.slipNo || id}</Text>
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs uppercase">Slip Type:</Text><br />
                            <Text strong className="capitalize">{slipType}</Text>
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs uppercase">Total Amount:</Text><br />
                            <Text strong>{formatKCurrency(slipData?.subtotalAmt)}</Text>
                        </div>
                        <div>
                            <Text type="secondary" className="text-xs uppercase">Pending Amount:</Text><br />
                            <Text strong className="text-red-500">{formatKCurrency(slipData?.subtotalAmt)}</Text>
                        </div>
                    </div>

                    <Space direction="vertical" className="w-full" size="middle">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <Text strong>Payment Date <span className="text-red-500">*</span></Text>
                                <Input type="date" value={formData.payment_date} onChange={e => setFormData({ ...formData, payment_date: e.target.value })} className="mt-1" />
                            </Col>
                            <Col xs={24} md={12}>
                                <Text strong>Total Received Amount</Text>
                                <Input placeholder="0.00" value={formData.payment_amount} onChange={e => setFormData({ ...formData, payment_amount: e.target.value })} className="mt-1" />
                            </Col>
                            <Col xs={24} md={12}>
                                <Text strong>Payment Method <span className="text-red-500">*</span></Text>
                                <Select className="w-full mt-1" value={formData.payment_method} onChange={val => setFormData({ ...formData, payment_method: val })} options={[{ value: 'bank', label: 'Bank Transfer' }, { value: 'cash', label: 'Cash' }]} />
                            </Col>
                            <Col xs={24} md={12}>
                                <Text strong>Reference / UTR Number</Text>
                                <Input placeholder="Ref #" value={formData.reference_number} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} className="mt-1" />
                            </Col>
                        </Row>

                        <div className="mt-4 border rounded-lg overflow-hidden">
                            <div className="flex justify-between items-center p-3 bg-blue-600 text-white font-bold uppercase">
                                Transaction Breakdown
                                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">{transactions.length} Rows</span>
                            </div>
                            <Table
                                dataSource={transactions}
                                columns={columns}
                                pagination={false}
                                bordered
                                footer={() => (
                                    <div className="flex justify-end gap-4 font-bold text-xl py-2">
                                        Total Allocated: <span className="text-blue-700">₹{totalAllocated.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            />
                        </div>

                        <div className="p-4 bg-amber-400 rounded-lg text-white font-bold flex items-center shadow-md">
                            <input type="checkbox" className="mr-3 w-5 h-5 cursor-pointer" />
                            <span>Slip-Level Allocation <span className="font-normal opacity-90 ml-1">(Alternative: Automatically allocate across multiple slips)</span></span>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button size="large" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button type="primary" size="large" icon={<SaveOutlined />} loading={isAllocating} onClick={handleSubmit} className="bg-green-600 border-none px-10 font-bold">
                                Record Payment
                            </Button>
                        </div>
                    </Space>
                </ComponentCard>
            </div>
        </>
    );
}