import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Props = {
  summary: {
    currentBalance: number;
    totalCredits: number;
    totalDebits: number;
  };
};

const TopCards = ({ summary }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          ₹{summary.currentBalance}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Credits</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-green-600">
          ₹{summary.totalCredits}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Debits</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-red-600">
          ₹{summary.totalDebits}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopCards;
