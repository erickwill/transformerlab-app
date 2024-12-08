import React, { useEffect, useState } from 'react';

import {
  Button,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Typography,
  Box,
  CircularProgress,
} from '@mui/joy';
import { PlusCircleIcon } from 'lucide-react';
import Dropzone from 'react-dropzone';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { generateFriendlyName } from 'renderer/lib/utils';

import * as chatAPI from '../../../lib/transformerlab-api-sdk';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ImportRecipeModal({ open, setOpen, mutate }) {
  const [uploading, setUploading] = useState(false);
  const [dropzoneActive, setDropzoneActive] = React.useState(false);

  // For any variables that need to be reset on close
  const handleClose = () => {
    mutate();
    setOpen(false);
  };

  const uploadRecipe = async (file) => {

    // Read the recipe from the file so we can pass it as HTTP body
    const fullpath = file.path;
    const recipe_text = await fetch(`file://${fullpath}`)
      .then((res) => res.text())
      .catch((e) => {
        console.error(e);
        alert(e);
        return "";
      });
    if (!recipe_text) {
      handleClose();
      return;
    }
  
    // TODO: If the recipe has a name and there isn't a recipe with that name...
    // We should use the name in the recipe, no the filename or random!
    // const recipe_name = generateFriendlyName();
    // For now: Remove the last . and extension from the filename
    const recipe_name = file.name.replace(/\.[^/.]+$/, "");

    setUploading(true); //This is for the loading spinner
    const response = await fetch(
      chatAPI.Endpoints.Recipes.Import(recipe_name), {
      method: 'POST',
      body: recipe_text,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        const error_msg = `${response.statusText}`;
        throw new Error(error_msg);
      }
    })
    .then((data) => {
      console.log('Server response:', data);
    })
    .catch((error) => {
      alert(error);
    });
  
    setUploading(false);
    handleClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-lg">Import Recipe</Typography>
          <Divider sx={{ my: 2 }} />
          <Box // Making the modal a set size
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowY: 'hidden',
              width: '25vw',
              justifyContent: 'center',
            }}
          >
            <Dropzone
              onDrop={async (acceptedFiles) => {
                setDropzoneActive(false);
                for (const file of acceptedFiles) {
                  await uploadRecipe(file);
                }
              }}
              onDragEnter={() => {
                setDropzoneActive(true);
              }}
              onDragLeave={() => {
                setDropzoneActive(false);
              }}
              noClick
            >
              {({ getRootProps, getInputProps }) => (
                <div id="dropzone_baby" {...getRootProps()}>
                  <Sheet
                    color="primary"
                    variant="soft"
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '0rem',
                      overflow: 'hidden',
                      minHeight: '130px',
                      border: dropzoneActive
                        ? '2px solid var(--joy-palette-warning-400)'
                        : '2px dashed var(--joy-palette-neutral-300)',
                      borderRadius: '8px',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'var(--joy-palette-neutral-400)',
                    }}
                  >
                    <IoCloudUploadOutline size="36px" /> Drag files here
                    <Typography level="body-xs" color="neutral" mt={3}>
                      Allowed filetypes: .yaml
                    </Typography>
                  </Sheet>
                </div>
              )}
            </Dropzone>
            <Button
              startDecorator={<PlusCircleIcon />}
              onClick={() => {
                var input = document.createElement('input');
                input.type = 'file';
                input.multiple = false; // Don't allow multiple files
                input.accept = '.yaml'; //Only allow YAML files

                input.onchange = async (e) => {
                  let files = Array.from(input.files);
                  for (const file of files) {
                    await uploadRecipe(file);
                  }
                };
                input.click();
              }}
              disabled={uploading}
            >
              {uploading ? <CircularProgress /> : 'Add files'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}
