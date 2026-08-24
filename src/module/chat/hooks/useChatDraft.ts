import { useCallback, useEffect, useState } from "react";
import type { UseDraftOptions } from "@/module/chat/types";

export function useChatDraft<T>(options: UseDraftOptions<T>) {
	const { key, initialValue, maxAge, onLoaded } = options;
	const [draft, setDraft] = useState<T>(initialValue);
	const [hasLoaded, setHasLoaded] = useState(false);

	// Save draft to localStorage
	const saveDraft = useCallback(
		(value: T) => {
			try {
				const dataToSave = {
					value,
					timestamp: Date.now(),
				};
				localStorage.setItem(key, JSON.stringify(dataToSave));
			} catch (error) {
				console.warn(`Failed to save draft for key "${key}":`, error);
			}
		},
		[key]
	);

	// Load draft from localStorage
	const loadDraft = useCallback((): T | null => {
		try {
			const draftStr = localStorage.getItem(key);
			if (draftStr) {
				const parsed = JSON.parse(draftStr) as { value: T; timestamp: number };

				if (maxAge && Date.now() - parsed.timestamp > maxAge) {
					localStorage.removeItem(key);
					return null;
				}
				return parsed.value;
			}
		} catch (error) {
			console.warn(`Failed to load draft for key "${key}":`, error);
		}
		return null;
	}, [key, maxAge]);

	// Clear draft from localStorage
	const clearDraft = useCallback(() => {
		try {
			localStorage.removeItem(key);
			setDraft(initialValue);
		} catch (error) {
			console.warn(`Failed to clear draft for key "${key}":`, error);
		}
	}, [key]);

	// Load draft on initial render
	useEffect(() => {
		const savedDraft = loadDraft();

		if (savedDraft) {
			setDraft(savedDraft);
			onLoaded?.(savedDraft);
		}
		setHasLoaded(true);
	}, []);

	useEffect(() => {
		if (!hasLoaded) return;
		saveDraft(draft);
	}, [draft, hasLoaded]);

	return {
		draft,
		setDraft,
		clearDraft,
		hasLoaded,
	};
}
