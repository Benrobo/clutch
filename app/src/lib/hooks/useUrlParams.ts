import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { derived, type Readable } from 'svelte/store';

type ParamOptions = {
	keepFocus?: boolean;
	replaceState?: boolean;
};

type ParamValue = string | number | boolean;

type ParamConfig<T> = {
	key: string;
	defaultValue?: T;
	transform?: (value: string) => T;
};

export function useUrlParams() {
	const getCurrentParams = () => {
		return new URLSearchParams(window.location.search);
	};

	const getParam = <T extends ParamValue = string>(
		config: ParamConfig<T>
	): Readable<T> & {
		set: (value: T, options?: ParamOptions) => void;
		remove: (options?: ParamOptions) => void;
	} => {
		const store = derived(page, ($page) => {
			const param = $page.url.searchParams.get(config.key);
			if (!param && config.defaultValue !== undefined) return config.defaultValue;
			if (!param) return '' as T;
			return config.transform ? config.transform(param) : (param as T);
		});

		const set = (value: T, { keepFocus = true, replaceState = false }: ParamOptions = {}) => {
			const url = new URL(window.location.href);
			url.searchParams.set(config.key, String(value));
			goto(url.toString(), { keepFocus, replaceState });
		};

		const remove = ({ keepFocus = true, replaceState = false }: ParamOptions = {}) => {
			const url = new URL(window.location.href);
			url.searchParams.delete(config.key);
			goto(url.toString(), { keepFocus, replaceState });
		};

		return {
			...store,
			set,
			remove
		};
	};

	const updateParams = (
		params: Record<string, ParamValue>,
		{ keepFocus = true, replaceState = false }: ParamOptions = {}
	) => {
		const url = new URL(window.location.href);
		const currentParams = url.searchParams;

		let hasChanges = false;
		Object.entries(params).forEach(([key, value]) => {
			const currentValue = currentParams.get(key);
			// Only update if the value is different
			if (currentValue !== String(value)) {
				currentParams.set(key, String(value));
				hasChanges = true;
			}
		});

		if (hasChanges) {
			goto(url.toString(), { keepFocus, replaceState });
		}
	};

	const deleteParams = (
		params: string | string[],
		{ keepFocus = true, replaceState = false }: ParamOptions = {}
	) => {
		const url = new URL(window.location.href);
		const paramsToDelete = Array.isArray(params) ? params : [params];

		let hasChanges = false;
		paramsToDelete.forEach((param) => {
			if (url.searchParams.has(param)) {
				url.searchParams.delete(param);
				hasChanges = true;
			}
		});

		if (hasChanges) {
			goto(url.toString(), { keepFocus, replaceState });
		}
	};

	const getAll = () => {
		return derived(page, ($page) => {
			const params: Record<string, string> = {};
			$page.url.searchParams.forEach((value, key) => {
				params[key] = value;
			});
			return params;
		});
	};

	return {
		getParam,
		updateParams,
		deleteParams,
		getAll,
		getCurrentParams
	};
}
