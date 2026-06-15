import "./ConfirmDelete.scss";

export default function ConfirmDelete({ label, onConfirm, onCancel }) {
    return (
        <div className="confirm-delete" role="alert">
            <p className="confirm-delete-message">
                ნამდვილად გინდა <strong>„{label}"</strong>-ის წაშლა?
            </p>
            <div className="confirm-delete-actions">
                <button
                    type="button"
                    className="confirm-delete-btn confirm-delete-btn-yes"
                    onClick={onConfirm}
                >
                    წაშლა
                </button>
                <button
                    type="button"
                    className="confirm-delete-btn confirm-delete-btn-no"
                    onClick={onCancel}
                >
                    გაუქმება
                </button>
            </div>
        </div>
    );
}
