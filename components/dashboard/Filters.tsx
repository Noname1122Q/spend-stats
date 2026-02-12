import { Card, CardContent } from "../ui/card";

type Props = {
  fromDate: string;
  toDate: string;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  applyFilters: () => void;
};

const Filters = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  applyFilters,
}: Props) => {
  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row gap-4 items-end p-6">
        <div>
          <label className="text-sm font-medium">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-md px-3 py-2 w-full"
          />
        </div>

        <button
          onClick={applyFilters}
          className="bg-primary text-white px-6 py-2 rounded-md"
        >
          Apply Filters
        </button>
      </CardContent>
    </Card>
  );
};

export default Filters;
