import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Kbd } from "../ui/kbd";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CircleXIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";

type InviteForm = {
  invites: { email: string; role: string }[];
};

export function InviteMemberModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  //   const [inputCount, setInputCount] = useState(1);
  const { control, register, handleSubmit } = useForm<InviteForm>({
    defaultValues: {
      invites: [{ email: "", role: "member" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invites",
  });

  function handleClick() {
    if (fields.length >= 3) {
      toast.error("Can't send more than 3 emails at once");
      return;
    }
    append({ email: "", role: "member" });
  }

  function onSubmit(data: InviteForm) {
    console.log("data", data);

    const emails = data.invites.map((i) => i.email);
    const hasDuplicates = new Set(emails).size !== emails.length;
    if (hasDuplicates) {
      toast.error("Duplicate emails found");
      return;
    }
  }

  return (
    <Modal showModal={show} setShowModal={setShow}>
      <div className="flex flex-col items-center justify-center space-y-4 border-b border-border">
        <div className="flex flex-col space-y-1 items-start justify-center p-2 sm:p-4 w-full">
          <h3 className="font-medium text-xl">Invite Teammates</h3>
          <p className="text-neutral-500 text-sm text-start">
            {/* Need to implement tool tip for documentation site for more information*/}
            <span>
              Invite teamates with{" "}
              <a className="underline">different roles and permissions.</a>
            </span>
            <br />
            <span>Invitations will be valid for 14 days.</span>
          </p>
        </div>
      </div>
      <div className="bg-accent/50 flex flex-col gap-y-4 p-2  sm:p-4 items-center justify-center">
        <form
          className="flex flex-col space-y-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Email</p>
            {fields.map((field, index) => (
              <div className="flex gap-0" key={index}>
                <Input
                  key={field.id}
                  autoFocus
                  placeholder="member@email.com"
                  {...register(`invites.${index}.email` as const, {
                    required: "Email is required",
                  })}
                  className="rounded-r-none"
                />
                <RoleSelector
                  control={control}
                  name={`invites.${index}.role`}
                />
                {fields.length > 1 && (
                  <Button
                    variant="custom"
                    className="w-fit ml-2"
                    onClick={() => remove(index)}
                  >
                    <CircleXIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              className="w-fit py-2.5"
              size="sm"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <Plus className="w-4 h-4" />
              Add email
            </Button>
          </div>
          <Button size="lg" Initial="Send Invite" Loading="Send Invite" />
        </form>
      </div>
    </Modal>
  );
}

function InviteMemberButton({
  setShow,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      className="w-fit gap-1.5"
      onClick={() => {
        setShow(true);
      }}
      variant="outline"
      size="sm"
    >
      <span className="hidden sm:inline">Invite Member</span>
      <Kbd>M</Kbd>
    </Button>
  );
}

export function useInviteMemberModal() {
  const [show, setShow] = useState(false);

  const InviteMemberButtonCallback = useCallback(
    () => <InviteMemberButton setShow={setShow} />,
    [setShow]
  );

  const InviteMemberModalCallback = useCallback(() => {
    return <InviteMemberModal show={show} setShow={setShow} />;
  }, [show, setShow]);

  return useMemo(
    () => ({
      InviteMemberButton: InviteMemberButtonCallback,
      InviteMemberModal: InviteMemberModalCallback,
    }),
    [setShow, InviteMemberButtonCallback, InviteMemberModalCallback]
  );
}

function RoleSelector({
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
