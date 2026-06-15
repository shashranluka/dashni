import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDelete from "../components/ConfirmDelete/ConfirmDelete";

export function useConfirmDelete() {
    const [pending, setPending] = useState(null);
    const resolveRef = useRef(null);

    const confirm = (label) =>
        new Promise((resolve) => {
            resolveRef.current = resolve;
            setPending({ label });
        });

    const ConfirmDialog = pending
        ? createPortal(
              <div className="confirm-delete-backdrop">
                  <ConfirmDelete
                      label={pending.label}
                      onConfirm={() => {
                          setPending(null);
                          resolveRef.current(true);
                      }}
                      onCancel={() => {
                          setPending(null);
                          resolveRef.current(false);
                      }}
                  />
              </div>,
              document.body,
          )
        : null;

    return { confirm, ConfirmDialog };
}
