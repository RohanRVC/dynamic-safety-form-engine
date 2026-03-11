import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FormBuilder from "@/components/FormBuilder/FormBuilder";
import FieldEditor from "@/components/FieldEditor/FieldEditor";
import LogicBuilder from "@/components/LogicEngine/LogicBuilder";
import LivePreview from "@/components/SchemaParser/LivePreview";
import { useFormStore } from "@/store/formStore";
import { formApi } from "@/services/api";
import toast from "react-hot-toast";

export default function FormBuilderPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { loadForm, resetForm } = useFormStore();

  useEffect(() => {
    if (editId) {
      formApi
        .get(editId)
        .then((data) => loadForm(data))
        .catch(() => toast.error("Failed to load form"));
    } else {
      resetForm();
    }
  }, [editId]);

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden">
      {/* Left Panel: Form Builder */}
      <div className="w-full lg:w-[380px] flex-shrink-0 border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-[40vh] lg:min-h-0">
        <FormBuilder editId={editId ? Number(editId) : null} />
      </div>

      {/* Center Panel: Logic Builder + Live Preview */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <LogicBuilder />
          <div className="glass-card overflow-hidden" style={{ minHeight: 400 }}>
            <LivePreview />
          </div>
        </div>
      </div>

      {/* Right Panel: Field Properties */}
      <div className="w-full lg:w-[300px] flex-shrink-0 border-t lg:border-t-0 lg:border-l overflow-hidden min-h-[280px] lg:min-h-0 max-h-[50vh] lg:max-h-none">
        <FieldEditor />
      </div>
    </div>
  );
}
