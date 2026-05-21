import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { toast } from "sonner";

type ConfirmModalProps = {
  title: string;
  description?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant: "secondary" | "destructive";
};

function ConfirmModal({
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onConfirm,
  onCancel,
  showConfirmModal,
  setShowConfirmModal,
  variant,
}: {
  showConfirmModal: boolean;
  setShowConfirmModal: Dispatch<SetStateAction<boolean>>;
} & ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setShowConfirmModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal showModal={showConfirmModal} setShowModal={setShowConfirmModal}>
      <div className="p-4 flex  flex-col items-start justify-center gap-1">
        <div className="text-lg font-semibold">{title}</div>
        <div>{description}</div>
        <div className="flex justify-end gap-2 w-full mt-4">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onCancel?.();
              setShowConfirmModal(false);
            }}
            className="w-fit"
            Initial={cancelText}
          />
          <Button
            variant={variant}
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            className="w-fit"
            Initial={confirmText}
            isSubmitting={isLoading}
            Loading=""
          />
        </div>
      </div>
    </Modal>
  );
}

export function useConfirmModal(props: ConfirmModalProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return {
    setShowConfirmModal,
    ConfirmModal: (
      <ConfirmModal
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        {...props}
      />
    ),
  };
}
