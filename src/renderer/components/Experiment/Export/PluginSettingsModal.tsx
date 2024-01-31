import { useState, FormEvent } from 'react';
import useSWR from 'swr';

import * as chatAPI from 'renderer/lib/transformerlab-api-sdk';

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Select,
  Option,
  Slider,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Sheet,
} from '@mui/joy';
import {
    ArrowRightFromLineIcon,
} from 'lucide-react';

const DefaultPluginConfig = {
  model_quant_bits: 4,
};

const fetcher = (url) => fetch(url).then((res) => res.json());

/**
 * PluginSettingsModal
 * onClose is a function that gets executed anytime this modal gets closed (cancel or submit)
 * onSubmit is a function that gets executed only when this form is submitted
 */
export default function PluginSettingsModal({ onClose, onSubmit, experimentInfo, pluginId }) {

  const currentModelName = experimentInfo?.config?.foundation;

  if (!experimentInfo?.id) {
    return 'Select an Experiment';
  }

  // create a default output model name that can be overridden in the UI
  function defaultOutputModelName(input_model_name, plugin_info) {
    const short_model_name = input_model_name.substring(input_model_name.lastIndexOf('/')+1);
    return short_model_name + " - " + plugin_info;
  }

  return (
    <Modal open={pluginId}>
      <ModalDialog
        sx={{
          width: '70vw',
          transform: 'translateX(-50%)', // This undoes the default translateY that centers vertically
          top: '10vh',
          overflow: 'auto',
          maxHeight: '80vh',
          minHeight: '70vh',
          height: '100%',
        }}
      >
        <form
          id="training-form"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form_data = new FormData(event.currentTarget);
            const form_json = Object.fromEntries((form_data as any).entries());

            onSubmit(form_json);
            onClose();
          }}
        >
         
          <Stack spacing={2}>
            <FormControl>
                  <FormLabel>Output Model Name</FormLabel>
                  <Input
                    required
                    autoFocus
                    value={defaultOutputModelName(currentModelName, pluginId)}
                    name="output_model_name"
                    size="lg"
                  />
                  <FormHelperText>
                    This is the name the model will have in the Local Models list
                  </FormHelperText>
                </FormControl><FormControl>
            </FormControl>
            <Stack direction="row" justifyContent="space-evenly" gap={2}>
                <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Exporter plugin:</FormLabel>
                    <Typography variant="soft">{pluginId}</Typography>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Export Architecture:</FormLabel>
                    <Typography variant="soft">
                      {pluginId}
                    </Typography>
                </FormControl>

                <input
                    hidden
                    value={pluginId}
                    name="plugin_name"
                    readOnly
                />
                <input
                    hidden
                    value={
                      ""
                    }
                    name="plugin_other"
                    readOnly
                />
            </Stack>
            <Stack direction="row" justifyContent="space-evenly" gap={2}>
                <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Input Model:</FormLabel>
                    <Typography variant="soft">{currentModelName}</Typography>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                    <FormLabel>Input Architecture:</FormLabel>
                    <Typography variant="soft">
                      {experimentInfo?.config?.foundation_model_architecture}
                    </Typography>
                </FormControl>

                <input
                    hidden
                    value={currentModelName}
                    name="input_model_name"
                    readOnly
                />
                <input
                    hidden
                    value={
                      experimentInfo?.config?.foundation_model_architecture
                    }
                    name="input_model_architecture"
                    readOnly
                />
            </Stack>
            {/** 
            <DynamicPluginForm
                experimentInfo={experimentInfo}
                plugin={pluginId}
            />
            */}
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            <Button color="danger" variant="soft" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button
                variant="soft"
                type="submit"
                startDecorator={<ArrowRightFromLineIcon />}>
              Export
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
