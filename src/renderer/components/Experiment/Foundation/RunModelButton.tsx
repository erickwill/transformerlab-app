import {
  Button,
  CircularProgress,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Select,
  Stack,
  Switch,
  Option,
  Typography,
  Tooltip,
} from '@mui/joy';
import { CogIcon, PlayCircleIcon, StopCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { activateWorker } from 'renderer/lib/transformerlab-api-sdk';

import InferenceEngineModal from './InferenceEngineModal';

export default function RunModelButton({
  experimentInfo,
  killWorker,
  models,
  mutate = () => {},
}) {
  const [jobId, setJobId] = useState(null);
  const [showRunSettings, setShowRunSettings] = useState(false);
  const [inferenceSettings, setInferenceSettings] = useState({
    inferenceEngine: null,
  });

  function isPossibleToRunAModel() {
    return experimentInfo != null && experimentInfo?.config?.foundation !== '';
  }

  useEffect(() => {
    if (experimentInfo?.config?.inferenceParams) {
      setInferenceSettings(JSON.parse(experimentInfo?.config?.inferenceParams));
    }
  }, [experimentInfo]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0px',
      }}
    >
      {/* {JSON.stringify(models)} */}
      {/* {jobId} */}
      {/* {JSON.stringify(experimentInfo)} */}
      {models === null ? (
        <>
          <Button
            startDecorator={
              jobId === -1 ? (
                <CircularProgress size="sm" thickness={2} />
              ) : (
                <PlayCircleIcon />
              )
            }
            color="success"
            size="lg"
            sx={{ fontSize: '1.1rem', marginRight: 1, minWidth: '200px' }}
            onClick={async (e) => {
              setJobId(-1);

              const inferenceEngine = inferenceSettings?.inferenceEngine;

              const response = await activateWorker(
                experimentInfo?.config?.foundation,
                experimentInfo?.config?.foundation_filename,
                experimentInfo?.config?.adaptor,
                inferenceEngine,
                inferenceSettings,
                experimentInfo?.id
              );
              const job_id = response?.job_id;
              setJobId(job_id);
              mutate();
            }}
            disabled={!isPossibleToRunAModel()}
          >
            Run
          </Button>
        </>
      ) : (
        <Button
          onClick={async () => {
            await killWorker();
            setJobId(null);
          }}
          startDecorator={
            models?.length == 0 ? (
              <CircularProgress size="sm" thickness={2} />
            ) : (
              <StopCircleIcon />
            )
          }
          color="success"
          size="lg"
          sx={{ fontSize: '1.1rem', marginRight: 1, minWidth: '200px' }}
        >
          Stop
        </Button>
      )}
      <IconButton
        variant="plain"
        color="neutral"
        size="md"
        disabled={models?.length > 0 || jobId == -1}
        onClick={() => setShowRunSettings(!showRunSettings)}
      >
        <Tooltip
          variant="soft"
          title={
            <Stack
              sx={{ fontSize: '12px', minWidth: '80px' }}
              justifyContent="space-between"
            >
              {Object.entries(inferenceSettings)?.map(([key, value]) => (
                <Typography key={key}>
                  {key}: {value}
                </Typography>
              ))}
            </Stack>
          }
        >
          <CogIcon color="var(--joy-palette-neutral-500)" />
        </Tooltip>
      </IconButton>
      <InferenceEngineModal
        showModal={showRunSettings}
        setShowModal={setShowRunSettings}
        experimentInfo={experimentInfo}
        inferenceSettings={inferenceSettings}
        setInferenceSettings={setInferenceSettings}
      />
    </div>
  );
}