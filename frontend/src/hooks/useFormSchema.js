import { useState, useEffect, useCallback } from "react";
import { formApi, branchApi } from "@/services/api";

export function useFormSchema(formId) {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchema = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await formApi.get(formId);
      setSchema(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  return { schema, loading, error, refetch: fetchSchema };
}

export function useBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branchApi
      .list()
      .then(setBranches)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { branches, loading };
}

export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await formApi.list();
      setForms(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return { forms, loading, refetch: fetchForms };
}
