import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
    UserAddOutlined,
    UserOutlined,
    BankOutlined,
    AreaChartOutlined,
    FileDoneOutlined,
    UploadOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons';

// Components
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import Input from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import Button from '../../components/ui/button/Button';
import Checkbox from '../../components/form/input/Checkbox';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';

// Hooks
import { useCreateCustomer } from '../../hooks/useCustomers';
import { useCompanies } from '../../hooks/useCompanies';

export default function CreateUser() {
    const { mutate, isPending } = useCreateCustomer();

    // Fetch companies using your existing hook
    const { data: companyData, isLoading: isLoadingCompanies } = useCompanies();

    // Map company data to Select options format
    const companyOptions = companyData?.data?.map((company: any) => ({
        value: String(company.id),
        label: company.companyName,
    })) || [];

    // Local state for UI file tracking
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({
        panCardDoc: null,
        aadharDoc: null,
        companyPanDoc: null,
        visitingCardDoc: null,
    });

    const [form, setForm] = useState({
        isBorrower: false,
        isLender: false,
        lenderGroup: '',
        borrowerGroup: '',
        fullName: '',
        emailAddress: '',
        mobileNumber: '',
        alternateMobileNumber: '',
        panNumber: '',
        aadharNumber: '',
        address: '',
        companyId: '', // Managed by Select
        businessName: '',
        gstNumber: '',
        businessAddress: '',
        natureOfBusiness: '',
        typeOfBusiness: '',
        companyPanNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        city: '',
        accountHolderName: '',
        panCardDoc: '',
        aadharDoc: '',
        companyPanDoc: '',
        visitingCardDoc: '',
    });

    const resetForm = () => {
        // Reset the text/boolean form state
        setForm({
            isBorrower: false,
            isLender: false,
            lenderGroup: '',
            borrowerGroup: '',
            fullName: '',
            emailAddress: '',
            mobileNumber: '',
            alternateMobileNumber: '',
            panNumber: '',
            aadharNumber: '',
            address: '',
            companyId: '',
            businessName: '',
            gstNumber: '',
            businessAddress: '',
            natureOfBusiness: '',
            typeOfBusiness: '',
            companyPanNumber: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            branchName: '',
            city: '',
            accountHolderName: '',
            panCardDoc: '',
            aadharDoc: '',
            companyPanDoc: '',
            visitingCardDoc: '',
        });

        // Reset the actual file trackers
        setSelectedFiles({
            panCardDoc: null,
            aadharDoc: null,
            companyPanDoc: null,
            visitingCardDoc: null,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setForm((prev) => ({ ...prev, companyId: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
            // Temporary placeholder logic for string DTO requirement
            setForm((prev) => ({ ...prev, [fieldName]: `uploads/${file.name}` }));
            toast.success(`${file.name} attached`);
        }
    };

    const removeFile = (fieldName: string) => {
        setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }));
        setForm((prev) => ({ ...prev, [fieldName]: '' }));
    };

    const handleSubmit = () => {
        // 1. Basic Validation
        if (!form.isBorrower && !form.isLender) {
            return toast.error('Select at least one: Borrower or Lender');
        }

        if (!form.fullName || !form.emailAddress || !form.mobileNumber || !form.companyId) {
            return toast.error('Please fill all required fields (*)');
        }

        // 2. Create FormData for multipart/form-data support
        const formData = new FormData();

        // 3. Append text/boolean fields (Cleaning empty strings)
        Object.entries(form).forEach(([key, value]) => {
            // Skip document path strings and empty values
            if (value !== "" && !['panCardDoc', 'aadharDoc', 'companyPanDoc', 'visitingCardDoc'].includes(key)) {
                formData.append(key, String(value));
            }
        });

        // 4. Append actual File objects matching backend interceptor names
        // Backend expects: panCard, aadhar, companyPan, visitingCard
        if (selectedFiles.panCardDoc) formData.append('panCard', selectedFiles.panCardDoc);
        if (selectedFiles.aadharDoc) formData.append('aadhar', selectedFiles.aadharDoc);
        if (selectedFiles.companyPanDoc) formData.append('companyPan', selectedFiles.companyPanDoc);
        if (selectedFiles.visitingCardDoc) formData.append('visitingCard', selectedFiles.visitingCardDoc);

        console.log("🚀 [API Request] Sending FormData...");

        mutate(formData, {
            onSuccess: (res) => {
                toast.success(res.message || 'Customer created successfully');
                resetForm(); // <--- Clear form after success
            },
            onError: (err: any) => {
                const errorData = err?.response?.data;
                const messages = errorData?.errors || [errorData?.message];
                toast.error(Array.isArray(messages) ? messages[0] : messages || 'Failed to create customer');
            },
        });
    };

    return (
        <>
            <PageMeta title="MKSK | Create User" description='Create User' />
            <PageBreadcrumb pageTitle="Create User" />

            <ComponentCard title="Create New User Profile">

                {/* 1. ROLE SELECTION */}
                <Section icon={<UserAddOutlined />} title="User Type">
                    <div className="mb-2">
                        <Label>Select appropriate role(s) *</Label>
                    </div>
                    <div className="flex gap-6 p-4 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-200 dark:border-gray-800">
                        <Checkbox
                            label="Borrower"
                            checked={form.isBorrower}
                            onChange={() => setForm({ ...form, isBorrower: !form.isBorrower })}
                        />
                        <Checkbox
                            label="Lender"
                            checked={form.isLender}
                            onChange={() => setForm({ ...form, isLender: !form.isLender })}
                        />
                    </div>

                    <div>
                        <Grid>
                            {
                                form.isBorrower && (
                                    <div  className='py-5'>
                                        <Label htmlFor="borrowerGroup">Borrower Group Name</Label>
                                        <Input
                                            name="borrowerGroup"
                                            id="borrowerGroup"
                                            value={form.borrowerGroup}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )
                            }
                            {form.isLender && (
                                <div className='py-5'>
                                    <Label htmlFor="lenderGroup">Lender Group Name</Label>
                                    <Input
                                        name="lenderGroup"
                                        id="lenderGroup"
                                        value={form.lenderGroup}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </Grid>
                    </div>
                </Section>

                {/* 2. PERSONAL INFORMATION */}
                <Section icon={<UserOutlined />} title="Personal Information">
                    <Grid>
                        <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input name="fullName" id="fullName" value={form.fullName} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="emailAddress">Email Address *</Label>
                            <Input name="emailAddress" id="emailAddress" value={form.emailAddress} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="mobileNumber">Mobile Number *</Label>
                            <Input name="mobileNumber" id="mobileNumber" value={form.mobileNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="alternateMobileNumber">Alt. Mobile</Label>
                            <Input name="alternateMobileNumber" id="alternateMobileNumber" value={form.alternateMobileNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="panNumber">PAN Number</Label>
                            <Input name="panNumber" id="panNumber" value={form.panNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="aadharNumber">Aadhaar Number</Label>
                            <Input name="aadharNumber" id="aadharNumber" value={form.aadharNumber} onChange={handleChange} />
                        </div>
                    </Grid>
                    <div className="mt-4">
                        <Label htmlFor="address">Residential Address</Label>
                        <TextArea id="address" rows={2} value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                    </div>
                </Section>

                {/* 3. COMPANY & BUSINESS */}
                <Section icon={<AreaChartOutlined />} title="Business & Company Details">
                    <Grid>
                        <div>
                            <Label htmlFor="companyId">Associate Company *</Label>
                            <Select
                                options={companyOptions}
                                placeholder={isLoadingCompanies ? "Loading..." : "Select Company"}
                                onChange={handleSelectChange}
                                defaultValue={form.companyId}
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input name="businessName" id="businessName" value={form.businessName} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input name="gstNumber" id="gstNumber" value={form.gstNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="natureOfBusiness">Nature of Business</Label>
                            <Input name="natureOfBusiness" id="natureOfBusiness" value={form.natureOfBusiness} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="typeOfBusiness">Type of Business</Label>
                            <Input name="typeOfBusiness" id="typeOfBusiness" value={form.typeOfBusiness} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="companyPanNumber">Company PAN</Label>
                            <Input name="companyPanNumber" id="companyPanNumber" value={form.companyPanNumber} onChange={handleChange} />
                        </div>
                    </Grid>
                    <div className="mt-4">
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <TextArea id="businessAddress" rows={2} value={form.businessAddress} onChange={(v) => setForm({ ...form, businessAddress: v })} />
                    </div>
                </Section>

                {/* 4. BANKING INFORMATION */}
                <Section icon={<BankOutlined />} title="Banking Information">
                    <Grid>
                        <div>
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input name="bankName" id="bankName" value={form.bankName} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input name="accountNumber" id="accountNumber" value={form.accountNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="ifscCode">IFSC Code</Label>
                            <Input name="ifscCode" id="ifscCode" value={form.ifscCode} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="branchName">Branch Name</Label>
                            <Input name="branchName" id="branchName" value={form.branchName} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Input name="city" id="city" value={form.city} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="accountHolderName">Account Holder Name</Label>
                            <Input name="accountHolderName" id="accountHolderName" value={form.accountHolderName} onChange={handleChange} />
                        </div>
                    </Grid>
                </Section>

                {/* 5. DOCUMENT UPLOADS */}
                <Section icon={<FileDoneOutlined />} title="Document Uploads">
                    <Grid>
                        {[
                            { label: 'PAN Card', key: 'panCardDoc' },
                            { label: 'Aadhaar Card', key: 'aadharDoc' },
                            { label: 'Company PAN', key: 'companyPanDoc' },
                            { label: 'Visiting Card', key: 'visitingCardDoc' },
                        ].map((doc) => (
                            <div key={doc.key} className="flex flex-col gap-2">
                                <Label>{doc.label}</Label>
                                <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:border-blue-400 transition-all">
                                    {!selectedFiles[doc.key] ? (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => handleFileChange(e, doc.key)}
                                                accept=".jpg,.jpeg,.png,.pdf"
                                            />
                                            <div className="flex flex-col items-center justify-center py-2 text-gray-400">
                                                <UploadOutlined className="text-xl mb-1" />
                                                <span className="text-xs italic">Upload {doc.label}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg">
                                            <span className="text-xs font-bold text-blue-800 dark:text-blue-400 truncate">
                                                {selectedFiles[doc.key]?.name}
                                            </span>
                                            <button type="button" onClick={() => removeFile(doc.key)} className="text-red-500 ml-2">
                                                <CloseCircleOutlined />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Grid>
                </Section>

                <div className="flex justify-end mt-10 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <Button onClick={handleSubmit} disabled={isPending} className="w-full md:w-1/3">
                        {isPending ? 'Saving Record...' : 'Complete Registration'}
                    </Button>
                </div>
            </ComponentCard>
        </>
    );
}

const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="mt-10 first:mt-4">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-800 pb-3">
            <span className="flex items-center justify-center w-10 h-10 bg-brand-500/10 text-brand-500 rounded-full text-xl shadow-sm">
                {icon}
            </span>
            <h3 className="font-bold text-gray-800 dark:text-white/90 text-base uppercase tracking-wider">{title}</h3>
        </div>
        <div className="px-1">{children}</div>
    </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {children}
    </div>
);