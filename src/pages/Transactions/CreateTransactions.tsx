import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    FileAddOutlined,
    BankOutlined,
    UsergroupAddOutlined,
    PercentageOutlined,
} from '@ant-design/icons';

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
import { useCreateTransaction } from '../../hooks/useTransactions'; // Ensure this hook is created

export default function CreateTransactions() {
    const navigate = useNavigate();
    const { data: companyData, isLoading: companiesLoading } = useCompanies();
    const { data: customerData, isLoading: customersLoading } = useCustomers();
    const { mutate: createTransaction, isPending } = useCreateTransaction();

    const initialState = {
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
    };

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

    // Company options for standard Select
    const companyOptions = companyData?.data?.map((c: any) => ({
        value: String(c.id),
        label: c.companyName
    })) || [];

    // MultiSelect expects { value, text, selected }
    const lenderOptions = customerData?.data
        ?.filter((c: any) => c.isLender)
        .map((c: any) => ({
            value: String(c.id),
            text: c.fullName,
            selected: form.lender_ids.includes(String(c.id))
        })) || [];

    const borrowerOptions = customerData?.data
        ?.filter((c: any) => c.isBorrower)
        .map((c: any) => ({
            value: String(c.id),
            text: c.fullName,
            selected: form.borrower_ids.includes(String(c.id))
        })) || [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCommissionChange = (index: number, value: string) => {
        const newCommissions = [...form.comission_percentage];
        newCommissions[index] = value;
        setForm({ ...form, comission_percentage: newCommissions });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.company_id || !form.transaction_date || !form.amount_in_thousands) {
            return toast.error("Please fill required fields (*)");
        }

        if (form.lender_ids.length === 0 || form.borrower_ids.length === 0) {
            return toast.error("Please select at least one lender and one borrower");
        }

        const payload = {
            company_id: Number(form.company_id),
            transaction_type: form.transaction_type as 'S' | 'M',
            transaction_number_type: Number(form.transaction_number_type),
            transaction_date: form.transaction_date,
            month: form.month,
            amount_in_thousands: Number(form.amount_in_thousands),
            a_p_status: form.a_p_status as 'advanced' | 'past',
            lender_ids: form.lender_ids.map(Number),
            borrower_ids: form.borrower_ids.map(Number),
            interest_recieved: Number(form.interest_recieved),
            interest_paid: Number(form.interest_paid),
            comission_percentage: form.comission_percentage.map(Number),
            remarks: form.remarks,
        };

        createTransaction(payload, {
            onSuccess: () => {
                navigate('/create-transactions');
                setForm(initialState);
            },
            onError: (error: any) => {
                console.error("Submission error:", error);
            }
        });
    };

    if (companiesLoading || customersLoading) return <p className="p-6 text-center">Loading data...</p>;

    return (
        <>
            <PageMeta title="MKSK | Create Transaction" description="Add new transaction record" />
            <PageBreadcrumb pageTitle="New Transaction" />

            <ComponentCard title="Transaction Entry Form">

                {/* 1. ASSOCIATION */}
                <Section icon={<BankOutlined />} title="Association">
                    <div className="max-w-md">
                        <Label>Select Company *</Label>
                        <Select
                            options={companyOptions}
                            onChange={(v) => setForm({ ...form, company_id: v })}
                            placeholder="Choose Associate Company"
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
                                onChange={(v) => setForm({ ...form, transaction_type: v })}
                            />
                        </div>
                        <div>
                            <Label>Number Type [1/2] *</Label>
                            <Select
                                options={[{ value: '1', label: '1' }, { value: '2', label: '2' }]}
                                onChange={(v) => setForm({ ...form, transaction_number_type: Number(v) })}
                            />
                        </div>
                        <div>
                            <Label>Date * (MM/DD/YYYY)</Label>
                            <Input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Month</Label>
                            <Input name="month" placeholder="e.g. 5,2,3" value={form.month} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Amount (in thousands) *</Label>
                            <Input type="number" name="amount_in_thousands" value={form.amount_in_thousands} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>A/P Status</Label>
                            <Select
                                options={[{ value: 'advanced', label: 'Advanced' }, { label: 'Past', value: 'past' }]}
                                onChange={(v) => setForm({ ...form, a_p_status: v })}
                            />
                        </div>
                    </Grid>
                </Section>

                {/* 3. LENDERS & BORROWERS */}
                <Section icon={<UsergroupAddOutlined />} title="Parties Involved">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <MultiSelect
                                label="Select Lenders *"
                                options={lenderOptions}
                                onChange={(values) => setForm({ ...form, lender_ids: values })}
                            />
                        </div>
                        <div>
                            <MultiSelect
                                label="Select Borrowers *"
                                options={borrowerOptions}
                                onChange={(values) => setForm({ ...form, borrower_ids: values })}
                            />
                        </div>
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
                        <TextArea value={form.remarks} onChange={(v) => setForm({ ...form, remarks: v })} rows={3} />
                    </div>
                </Section>

                <div className="flex justify-end mt-8">
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full md:w-1/4"
                    >
                        {isPending ? "Saving..." : "Save Transaction"}
                    </Button>
                </div>
            </ComponentCard>
        </>
    );
}

const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="mt-8 first:mt-0">
        <div className="flex items-center gap-3 mb-4 border-b pb-2 dark:border-gray-800">
            <span className="text-brand-500 text-xl">{icon}</span>
            <h3 className="font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
    </div>
);