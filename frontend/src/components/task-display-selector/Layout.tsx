import { Columns3, Rows3, Calendar } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

function Layout() {
  return (
    <div className="p-3 flex flex-col gap-1 border-b border-border w-full">
      <p className="font-semibold text-[13px]">Layout</p>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="h-15! sm:w-70 w-full shadow-none!">
          <TabsTrigger value="list" className="flex flex-col">
            <Rows3 />
            List
          </TabsTrigger>
          <TabsTrigger value="board" className="flex flex-col">
            <Columns3 />
            Board
          </TabsTrigger>
          <TabsTrigger value="home" className="flex flex-col">
            <Calendar />
            Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default Layout;
