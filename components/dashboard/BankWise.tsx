import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Props = {
  bankSplit: any[];
};

const BankWise = ({ bankSplit }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank-wise Transaction Share</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={bankSplit} dataKey="value" nameKey="bank" label>
              {bankSplit.map((_, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BankWise;
