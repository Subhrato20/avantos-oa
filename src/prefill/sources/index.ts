import { directUpstreamFormFieldsSource } from "./directUpstreamFormFields";
import { globalPropertiesSource } from "./globalProperties";
import { transitiveUpstreamFormFieldsSource } from "./transitiveUpstreamFormFields";
import type { PrefillDataSource } from "./types";

/**
 * Register all prefill data sources here. The modal iterates this list; add
 * a new `PrefillDataSource` module and append it to the array to extend.
 */
const sources: PrefillDataSource[] = [
  directUpstreamFormFieldsSource,
  transitiveUpstreamFormFieldsSource,
  globalPropertiesSource,
];

export function getAllPrefillSources(): PrefillDataSource[] {
  return sources;
}
