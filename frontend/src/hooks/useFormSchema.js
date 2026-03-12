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
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await branchApi.list();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { branches, loading, error, refetch };
}

export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formApi.list();
      // Backend returns an array; guard if shape ever changes
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load forms");
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  return { forms, loading, error, refetch: fetchForms };
}
