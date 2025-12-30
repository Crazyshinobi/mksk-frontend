import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileAddOutlined, BankOutlined, UsergroupAddOutlined, PercentageOutlined } from '@ant-design/icons';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';
import MultiSelect from '../../components/form/MultiSelect';

import { useCompanies } from '../../hooks/useCompanies';
import { useCustomers } from '../../hooks/useCustomers';
import { useTransaction, useUpdateTransaction } from '../../hooks/useTransactions';

export default function EditTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: companyData } = useCompanies();
    const { data: customerData } = useCustomers();
    const { data: transactionData, isLoading: isFetching } = useTransaction(Number(id));
    const { mutate: updateTransaction, isPending } = useUpdateTransaction();

    const [form, setForm] = useState({
        company_id: '',
        transaction_type: 'S',
        transaction_number_type: 1,
        transaction_date: '',
        month: '',
        amount_in_thousands: '',
        a_p_status: 'advanced',
        lender_ids: [] as string[],
        borrower_ids: [] as string[],
        interest_recieved: '0',
        interest_paid: '0',
        comission_percentage: [''],
        remarks: '',
    });

    useEffect(() => {
        if (transactionData?.data) {
            const t = transactionData.data;
            setForm({
                company_id: String(t.company?.id || ''),
                transaction_type: t.transaction_type,
                transaction_number_type: t.transaction_number_type,
                transaction_date: t.transaction_date ? t.transaction_date.split('T')[0] : '',
                month: t.month || '',
                amount_in_thousands: String(t.amount_in_thousands || ''),
                a_p_status: t.a_p_status || 'advanced',
                lender_ids: t.lenders?.map((l: any) => String(l.id)) || [],
                borrower_ids: t.borrowers?.map((b: any) => String(b.id)) || [],
                interest_recieved: String(t.interest_recieved || '0'),
                interest_paid: String(t.interest_paid || '0'),
                comission_percentage: t.comission_percentage?.length > 0 ? t.comission_percentage.map(String) : [''],
                remarks: t.remarks || '',
            });
        }
    }, [transactionData]);

    const companyOptions = companyData?.data?.map((c: any) => ({ value: String(c.id), label: c.companyName })) || [];

    const lenderOptions = customerData?.data?.filter((c: any) => c.isLender).map((c: any) => ({
        value: String(c.id), text: c.fullName
    })) || [];

    const borrowerOptions = customerData?.data?.filter((c: any) => c.isBorrower).map((c: any) => ({
        value: String(c.id), text: c.fullName
    })) || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCommissionChange = (index: number, value: string) => {
        const newComms = [...form.comission_percentage];
        newComms[index] = value;
        setForm({ ...form, comission_percentage: newComms });
    };

    const handleSubmit = async () => {
        if (!form.company_id || !form.transaction_date || !form.amount_in_thousands) {
            return toast.error("Please fill required fields (*)");
        }

        const payload = {
            ...form,
            transaction_type: form.transaction_type as "S" | "M",
            a_p_status: form.a_p_status as "advanced" | "past",
            company_id: Number(form.company_id),
            transaction_number_type: Number(form.transaction_number_type),
            amount_in_thousands: Number(form.amount_in_thousands),
            lender_ids: form.lender_ids.map(Number),
            borrower_ids: form.borrower_ids.map(Number),
            comission_percentage: form.comission_percentage.map(Number),
            interest_recieved: Number(form.interest_recieved),
            interest_paid: Number(form.interest_paid),
        };

        updateTransaction({ id: Number(id), payload }, {
            onSuccess: () => navigate('/view-transactions')
        });
    };

    if (isFetching) return <p className="p-10 text-center">Loading transaction details...</p>;

    return (
        <>
            <PageMeta title="MKSK | Edit Transaction" description="Modify existing transaction" />
            <PageBreadcrumb pageTitle="Edit Transaction" />

            <ComponentCard title={`Edit Transaction #${id}`}>
                {/* 1. ASSOCIATION */}
                <Section icon={<BankOutlined />} title="Association">
                    <div className="max-w-md">
                        <Label>Select Company *</Label>
                        <Select
                            options={companyOptions}
                            value={form.company_id}
                            onChange={(v) => setForm({ ...form, company_id: v })}
                        />
                    </div>
                </Section>

                {/* 2. BASIC INFO */}
                <Section icon={<FileAddOutlined />} title="Transaction Details">
                    <Grid>
                        <div>
                            <Label>Type [S/M] *</Label>
                            <Select
                                options={[{ value: 'S', label: 'S' }, { value: 'M', label: 'M' }]}
                                value={form.transaction_type}
                                onChange={(v) => setForm({ ...form, transaction_type: v })}
                            />
                        </div>
                        <div>
                            <Label>Number Type [1/2] *</Label>
                            <Select
                                options={[{ value: '1', label: '1' }, { value: '2', label: '2' }]}
                                value={String(form.transaction_number_type)}
                                onChange={(v) => setForm({ ...form, transaction_number_type: Number(v) })}
                            />
                        </div>
                        <div>
                            <Label>Date *</Label>
                            <Input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Month</Label>
                            <Input name="month" placeholder="e.g. December" value={form.month} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Amount (in thousands) *</Label>
                            <Input type="number" name="amount_in_thousands" value={form.amount_in_thousands} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>A/P Status</Label>
                            <Select
                                options={[{ value: 'advanced', label: 'Advanced' }, { value: 'past', label: 'Past' }]}
                                value={form.a_p_status}
                                onChange={(v) => setForm({ ...form, a_p_status: v })}
                            />
                        </div>
                    </Grid>
                </Section>

                {/* 3. PARTIES */}
                <Section icon={<UsergroupAddOutlined />} title="Parties Involved">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MultiSelect
                            label="Lenders *"
                            options={lenderOptions}
                            value={form.lender_ids}
                            onChange={(values) => setForm({ ...form, lender_ids: values })}
                        />
                        <MultiSelect
                            label="Borrowers *"
                            options={borrowerOptions}
                            value={form.borrower_ids}
                            onChange={(values) => setForm({ ...form, borrower_ids: values })}
                        />
                    </div>
                </Section>

                {/* 4. FINANCIALS */}
                <Section icon={<PercentageOutlined />} title="Interests & Commissions">
                    <Grid>
                        <div>
                            <Label>Interest Received</Label>
                            <Input type="number" name="interest_recieved" value={form.interest_recieved} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Interest Paid</Label>
                            <Input type="number" name="interest_paid" value={form.interest_paid} onChange={handleChange} />
                        </div>

                        <div className="col-span-full">
                            <Label>Commission Percentages (%)</Label>
                            {form.comission_percentage.map((val, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <Input
                                        placeholder="Enter %"
                                        value={val}
                                        onChange={(e) => handleCommissionChange(idx, e.target.value)}
                                    />
                                    {idx === form.comission_percentage.length - 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setForm({ ...form, comission_percentage: [...form.comission_percentage, ''] })}
                                        >
                                            + Add %
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Grid>
                    <div className="mt-4">
                        <Label>Remarks</Label>
                        <TextArea value={form.remarks} name="remarks"
                            onChange={(val: string) => setForm(prev => ({ ...prev, remarks: val }))}
                            rows={3} />
                    </div>
                </Section>

                <div className="flex justify-end mt-8 gap-4">
                    <Button variant="outline" onClick={() => navigate('/view-transactions')}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Updating..." : "Update Transaction"}
                    </Button>
                </div>
            </ComponentCard>
        </>
    );
}

const Section = ({ icon, title, children }: any) => (
    <div className="mt-8 first:mt-0">
        <div className="flex items-center gap-3 mb-4 border-b pb-2 dark:border-gray-800">
            <span className="text-brand-500 text-xl">{icon}</span>
            <h3 className="font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const Grid = ({ children }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
);