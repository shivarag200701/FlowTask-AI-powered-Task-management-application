import { useTags } from "@/hooks/use-tags";
import { Command } from "cmdk";
import { Kbd } from "../ui/kbd";

function TagDropDown() {
  const { data: tags } = useTags({ query: { search: "" } });
  console.log(tags);

  return (
    <Command label="Command Menu" className="w-[390px]">
      <div className="relative flex items-center">
        <Command.Input
          className=" pl-4 py-3 focus:outline-none text-sm "
          placeholder="search or add tags..."
        />
        <Kbd className="absolute right-2">T</Kbd>
      </div>
      <Command.Separator className="border-t border-border" alwaysRender />
      <Command.List className="p-1">
        <Command.Empty>No results found.</Command.Empty>

        {tags?.map((tag) => (
          <Command.Item key={tag.id} className="px-3 py-2">
            {tag.name}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
}

export default TagDropDown;
