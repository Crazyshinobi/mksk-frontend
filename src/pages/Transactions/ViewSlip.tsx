import { useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { PrinterOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { useTransactionSlip } from '../../hooks/useTransactions';

export default function ViewSlip() {
  const { id } = useParams();
  const location = useLocation();
  const printRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 🔹 Get Today's Date in DD/MM/YY format
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  const queryParams = new URLSearchParams(location.search);
  const slipType = (queryParams.get('type') as 'lender' | 'borrower') || 'lender';

  const { data: slipData, isLoading, isError } = useTransactionSlip(Number(id), slipType);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Transaction_Slip_${id}`,
  });

  if (isLoading) return <div className="p-10 text-center font-bold">LOADING SLIP...</div>;
  if (isError) return <div className="p-10 text-center text-red-500 font-bold">ERROR LOADING DATA.</div>;

  const data = slipData?.data;

  return (
    <>
      <PageMeta title={`MKSK | ${slipType.toUpperCase()} Slip`} description='Transactions Slip' />
      <PageBreadcrumb pageTitle={`${slipType.toUpperCase()} Transaction Slip`} />

      <div className="mb-6 flex justify-between items-center no-print">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Button onClick={() => handlePrint()}>
          <PrinterOutlined /> Print Slip
        </Button>
      </div>

      <ComponentCard title="Slip Preview">
        <div className="overflow-auto bg-gray-100 p-6 rounded-lg">
          <div
            ref={printRef}
            className="bg-white text-black font-bold slip-print-container mx-auto"
            style={{ width: '210mm', minHeight: '148mm', padding: '10mm' }}
          >
            {/* 1. Header Section */}
            <div className="grid grid-cols-12 border-[3px] border-black">
              <div className="col-span-6 p-4 text-center border-r-[3px] border-black text-2xl uppercase">
                {data?.header?.name || 'M/S A H P TRAVELS'}
              </div>
              <div className="col-span-3 p-4 text-center border-r-[3px] border-black text-2xl">
                {/* 🔹 Show Today's Date in Header */}
                {today}
              </div>
              <div className="col-span-3"></div>
            </div>

            {/* 2. Main Table */}
            <table className="w-full border-collapse border-x-[3px] border-b-[3px] border-black text-center">
              <thead>
                <tr className="border-b-[3px] border-black uppercase text-sm">
                  <th className="border-r-[2px] border-black p-2 w-28">CASH</th>
                  <th className="border-r-[3px] border-black p-2 w-1/3">PARTY</th>
                  <th className="border-r-[2px] border-black p-2">DUE</th>
                  <th className="border-r-[2px] border-black p-2">UP TO</th>
                  <th className="border-r-[2px] border-black p-2 w-12">M</th>
                  <th className="border-r-[2px] border-black p-2 w-12">A/P</th>
                  <th className="p-2 w-28">AMT</th>
                </tr>
              </thead>
              <tbody>
                {data?.rows?.map((row: any, index: number) => (
                  <tr key={index} className="border-b-[2px] border-black h-16 text-lg">
                    <td className="border-r-[2px] border-black">
                      {row.cash?.toLocaleString()}
                    </td>
                    <td className="border-r-[3px] border-black p-2 text-left">
                      <div className="text-xl uppercase">{row.partyName}</div>
                      <div className="text-xs font-normal text-gray-600">({row.partyStatus})</div>
                    </td>
                    <td className="border-r-[2px] border-black font-normal">{row.due}</td>
                    <td className="border-r-[2px] border-black font-normal">{row.upTo}</td>
                    <td className="border-r-[2px] border-black">{row.m}</td>
                    <td className="border-r-[2px] border-black">{row.ap}</td>
                    <td className="text-2xl">{row.amt}</td>
                  </tr>
                ))}

                {[...Array(6)].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b-[1px] border-black h-12">
                    <td className="border-r-[2px] border-black"></td>
                    <td className="border-r-[3px] border-black"></td>
                    <td className="border-r-[2px] border-black"></td>
                    <td className="border-r-[2px] border-black"></td>
                    <td className="border-r-[2px] border-black"></td>
                    <td className="border-r-[2px] border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>

              {/* 3. Subtotal Section */}
              <tfoot>
                <tr className="border-t-[3px] border-black h-14 text-2xl font-black">
                  <td className="border-r-[2px] border-black">
                    {data?.subtotalCash?.toLocaleString()}
                  </td>

                  <td className="border-r-[3px] border-black uppercase text-left pl-4 font-black">
                    A TOTAL
                  </td>

                  <td colSpan={4} className="border-r-[2px] border-black text-lg font-normal italic">
                    {/* 🔹 Show Today's Date in Footer Spacer */}
                    {today}
                  </td>

                  <td className="text-2xl font-black">
                    {data?.subtotalAmt}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 text-right text-[10px] font-normal text-gray-400">
              Generated on {data?.generatedAt}
            </div>
          </div>
        </div>
      </ComponentCard>

      <style>{`
        @media print {
            .no-print, header, aside, .PageBreadcrumb, .ant-breadcrumb {
                display: none !important;
            }
            body { background: white !important; }
            .slip-print-container {
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            @page {
                size: landscape;
                margin: 5mm;
            }
        }
      `}</style>
    </>
  );
}