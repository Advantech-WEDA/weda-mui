export function bridgeToggleDialogContent(name: string, isEnabled: boolean) {
  return isEnabled
    ? {
        title: 'Disable bridge',
        content: `Disabling "${name}" stops runtime processing and unsubscribes it from its data streams. Continue?`,
        confirmLabel: 'Disable',
      }
    : {
        title: 'Enable bridge',
        content: `Enable "${name}"? The linked MQTT broker connection is verified before the bridge starts.`,
        confirmLabel: 'Enable',
      };
}
