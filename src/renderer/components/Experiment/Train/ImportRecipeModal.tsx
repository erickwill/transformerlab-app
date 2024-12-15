import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Typography,
} from '@mui/joy';
import { PlusCircleIcon, InfoIcon } from 'lucide-react';
import Dropzone from 'react-dropzone';
import { IoCloudUploadOutline } from 'react-icons/io5';

import * as chatAPI from '../../../lib/transformerlab-api-sdk';

const YAML = require('yaml');

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ImportRecipeModal({ open, setOpen, mutate }) {
  const [uploading, setUploading] = useState(false);
  const [dropzoneActive, setDropzoneActive] = React.useState(false);

  const {
    data: recipesData,
    error: recipesError,
    isLoading: isLoading,
  } = useSWR(chatAPI.Endpoints.Recipes.Gallery(), fetcher);

  const recipes = recipesData;

  // For any variables that need to be reset on close
  const handleClose = () => {
    mutate();
    setOpen(false);
  };

  // Takes a file path, reads recipe data from it and then uploads reccipe text
  const uploadRecipeFile = async (file) => {
    // Read the recipe from the file so we can pass it as HTTP body
    const fullpath = file.path;
    const recipe_text = await fetch(`file://${fullpath}`)
      .then((res) => res.text())
      .catch((e) => {
        console.error(e);
        alert(e);
        return '';
      });
    if (!recipe_text) {
      handleClose();
      return;
    }

    // TODO: If the recipe has a name and there isn't a recipe with that name...
    // We should use the name in the recipe, not the filename!
    // const recipe_name = generateFriendlyName();
    // For now: Remove the last . and extension from the filename
    const recipe_name = file.name.replace(/\.[^/.]+$/, '');

    return uploadRecipe(recipe_name, recipe_text);
  };

  // Given a recipe string, uploads to API.
  const uploadRecipe = async (recipe_name: string, recipe_text: string) => {
    setUploading(true); //This is for the loading spinner
    const response = await fetch(
      chatAPI.Endpoints.Recipes.Import(recipe_name),
      {
        method: 'POST',
        body: recipe_text,
      }
    )
      .then((response) => {
        // First check that the API responded correctly
        if (response.ok) {
          return response.json();
        } else {
          const error_msg = `${response.statusText}`;
          throw new Error(error_msg);
        }
      })
      .then((data) => {
        // Then check the API responose to see if there was an error.
        console.log('Server response:', data);
        if (data?.status == "error") {
          throw new Error(data.message);
        }
        if (!data?.data) {
          throw new Error("Warning: Server response was missing expected field 'data'.");
        }
        return data.data;
      })
      .catch((error) => {
        alert(error);
        return false;
      });

    // If we have a response then recipe imported successfully.
    // Check if we need to download any assets so we can tell the user.
    if (response) {
      if (!response.model || !response.model.path) {
        alert("Warning: This recipe does not have an associated model")
      } else if (!response.dataset || ! response.dataset.path) {
        alert("Warning: This recipe does not have an associated dataset")
      } else {
        let msg = "";
        if (!response.model.downloaded) {
          msg += "Download model " + response.model.path
        }
        if (!response.dataset.downloaded) {
          msg += "Download dataset " + response.dataset.path
        }
        if (msg) {
          const alert_msg = "Warning: To use this recipe you will need to: " + msg
          alert(alert_msg);
        }
      }
    }

    setUploading(false);
    handleClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="title-lg">Recipe Gallery</Typography>

          <Box sx={{ maxHeight: '450px', overflow: 'auto' }}>
            <Table
              aria-labelledby="tableTitle"
              stickyHeader
              hoverRow
              sx={{
                '--TableCell-headBackground': (theme) =>
                  theme.vars.palette.background.level1,
                '--Table-headerUnderlineThickness': '1px',
                '--TableRow-hoverBackground': (theme) =>
                  theme.vars.palette.background.level1,
                height: '100px',
                overflow: 'auto',
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 180, padding: 10 }}>Name</th>
                  <th style={{ width: 150, padding: 10 }}>Plugin</th>
                  <th style={{ width: 220, padding: 10 }}>Dataset</th>
                  <th style={{ width: 35, padding: 10 }}> </th>
                  <th style={{ width: 60, padding: 10 }}> </th>
                </tr>
              </thead>
              <tbody>
                {!isLoading &&
                  recipes &&
                  recipes.map((row) => (
                    <tr key={row.metadata?.name}>
                      <td>
                        <Typography fontWeight="lg">
                          {row.metadata?.name}
                        </Typography>
                      </td>
                      <td>
                        <Typography fontWeight="sm" style={{overflow: 'hidden'}}>
                          {row.training?.plugin}
                        </Typography>
                      </td>
                      <td>
                        <Typography fontWeight="sm" style={{overflow: 'hidden'}}>
                          {row.datasets?.name}
                        </Typography>
                      </td>
                      <td>
                        <InfoIcon
                          size="28px"
                          color="var(--joy-palette-neutral-400)"
                          onClick={() => {
                            alert(row.metadata?.description);
                          }}
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => {
                            const recipe_text = YAML.stringify(row);
                            uploadRecipe(row.metadata?.name, recipe_text);
                          }}
                        >
                          Use
                        </Button>
                      </td>
                    </tr>
                  ))}
                {isLoading && (
                  <tr>
                    <td colSpan={5}>
                      <CircularProgress color="primary" />
                      <Typography
                        level="body-lg"
                        justifyContent="center"
                        margin={5}
                      >
                        Loading recipes...
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography level="title-lg"></Typography>
          <Box // Making the modal a set size
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowY: 'hidden',
              justifyContent: 'center',
            }}
          >
            <Dropzone
              onDrop={async (acceptedFiles) => {
                setDropzoneActive(false);
                for (const file of acceptedFiles) {
                  await uploadRecipeFile(file);
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
                    await uploadRecipeFile(file);
                  }
                };
                input.click();
              }}
              disabled={uploading}
            >
              {uploading ? <CircularProgress /> : 'Select file'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}