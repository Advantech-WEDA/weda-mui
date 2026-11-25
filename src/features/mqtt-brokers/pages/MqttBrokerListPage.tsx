import { Button, Stack, Typography } from '@mui/material';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  RevokeDialog,
  SelectElement,
  SvgIcon,
} from '@shared/ui';

import TableSection from '@/features/mqtt-brokers/components/TableSection';
import {
  type MqttProtocolVersion,
  mqttProtocolVersionOptions,
} from '@/features/mqtt-brokers/domain/types';
import { useMqttBrokersPage } from '@/features/mqtt-brokers/hooks/useMqttBrokersPage';

export default function MqttBrokerListPage() {
  const {
    hasPermission,
    searchWord,
    setSearchWord,
    protocolVersionFilter,
    handleProtocolVersionFilterChange,
    handleAdd,
    handleClearFilters,
    tableSectionProps,
    dialogOpen,
    selectedItem,
    handleClose,
    handleConfirmDelete,
    handleRefresh,
    inputValue,
    setInputValue,
    canDelete,
  } = useMqttBrokersPage();

  return (
    <PageListLayout
      title="MQTT Brokers"
      toolbar={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: '100%' }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            {hasPermission && (
              <PageActionButton
                variant="contained"
                startIcon={
                  <SvgIcon
                    name="Add"
                    sx={{ color: 'var(--primary-contrastText)' }}
                    className="page-action-btn__icon"
                  />
                }
                onClick={handleAdd}
              >
                <Typography variant="button" className="page-action-btn--add">
                  Add
                </Typography>
              </PageActionButton>
            )}

            <PageSearchField
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
            />

            <SelectElement
              value={protocolVersionFilter}
              onChange={(value) =>
                handleProtocolVersionFilterChange(
                  value as MqttProtocolVersion | ''
                )
              }
              placeholder="Protocol version"
              options={mqttProtocolVersionOptions}
            />

            <PageActionButton variant="outlined" onClick={handleClearFilters}>
              <Typography variant="button" className="page-action-btn--clear">
                Clear filters
              </Typography>
            </PageActionButton>
          </Stack>

          <Button
            startIcon={<SvgIcon name="RefreshFilled" />}
            onClick={handleRefresh}
            className="page-action-btn--refresh"
          />
        </Stack>
      }
    >
      <TableSection {...tableSectionProps} />

      <RevokeDialog
        open={dialogOpen}
        onClose={handleClose}
        title="Delete broker config"
        content={`Are you sure you want to delete broker config "${selectedItem?.name}"?`}
        inputLabel="Re-enter the broker name to confirm deletion"
        mismatchText="Broker name does not match."
        confirmName={selectedItem?.name ?? ''}
        confirmDisabled={!canDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirmDelete}
      />
    </PageListLayout>
  );
}
