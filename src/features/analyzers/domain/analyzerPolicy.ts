interface AnalyzerLike {
  isEnabled: boolean;
}

export interface AnalyzerActionState {
  enabled: boolean;

  disabledReason?: string;
}

export function getAnalyzerActions(
  row: AnalyzerLike,
  hasPermission: boolean
): { edit: AnalyzerActionState; delete: AnalyzerActionState } {
  const noPermission = 'You do not have permission to perform this action';

  const build = (verb: string): AnalyzerActionState =>
    !hasPermission
      ? { enabled: false, disabledReason: noPermission }
      : row.isEnabled
        ? {
            enabled: false,
            disabledReason: `Disable the analyzer before ${verb} it`,
          }
        : { enabled: true };

  return { edit: build('editing'), delete: build('deleting') };
}
