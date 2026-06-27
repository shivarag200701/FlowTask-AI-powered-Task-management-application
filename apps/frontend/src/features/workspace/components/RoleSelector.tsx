import type { InviteForm } from "@/components/modals/InviteMemberModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, type Control } from "react-hook-form";

export function RoleSelector({
  control,
  name,
}: {
  control: Control<InviteForm>;
  name: `invites.${number}.role`;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          defaultValue="member"
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger className="w-[180px] rounded-l-none">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white">
            <SelectGroup>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    />
  );
}
