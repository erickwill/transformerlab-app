import {
  Button,
  CircularProgress,
  IconButton,
  Sheet,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import { time } from 'console';
import { SendIcon, StopCircle } from 'lucide-react';
import { useState } from 'react';

export default function CompletionsPage({
  text,
  setText,
  debouncedText,
  tokenCount,
  isThinking,
  sendCompletionToLLM,
  stopStreaming,
}) {
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

  async function handleSend() {
    setTimeTaken(-1);
    const startTime = performance.now();
    await sendCompletionToLLM(
      document.getElementsByName('completion-text')?.[0],
      document.getElementsByName('completion-text')?.[0]
    );
    const endTime = performance.now();
    setTimeTaken(endTime - startTime);
  }

  function SubmitGenerateButton() {
    return (
      <>
        <Stack
          flexDirection="row"
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {isThinking && (
            <IconButton color="danger">
              <StopCircle onClick={stopStreaming} />
            </IconButton>
          )}
          <Button
            sx={{}}
            color="neutral"
            endDecorator={
              isThinking ? (
                <CircularProgress
                  thickness={2}
                  size="sm"
                  color="neutral"
                  sx={{
                    '--CircularProgress-size': '13px',
                  }}
                />
              ) : (
                <SendIcon size="20px" />
              )
            }
            disabled={isThinking}
            id="chat-submit-button"
            onClick={handleSend}
          >
            {isThinking ? <>Generating</> : 'Generate'}
          </Button>
        </Stack>
      </>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingBottom: '10px',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          flex: 1,
          overflow: 'auto',
          padding: 2,
          margin: 'auto',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <Textarea
          placeholder="When I was young, I would"
          variant="plain"
          name="completion-text"
          minRows={20}
          sx={{
            flex: 1,
            height: '100%',
            '--Textarea-focusedHighlight': 'rgba(13,110,253,0)',
            '& .MuiTextarea-textarea': { overflow: 'auto !important' },
          }}
          endDecorator={
            <Typography level="body-xs" sx={{ ml: 'auto' }}>
              {text !== debouncedText ? (
                <CircularProgress
                  color="neutral"
                  sx={{
                    '--CircularProgress-size': '16px',
                    '--CircularProgress-trackThickness': '4px',
                    '--CircularProgress-progressThickness': '3px',
                  }}
                />
              ) : (
                tokenCount?.tokenCount
              )}{' '}
              of {tokenCount?.contextLength} tokens
            </Typography>
          }
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
      </Sheet>
      <Stack direction="row" justifyContent="space-between">
        <div>
          {timeTaken && timeTaken !== -1 && (
            <Typography level="body-sm" color="neutral">
              Time taken: {Math.round(timeTaken)}ms
            </Typography>
          )}
          {timeTaken == -1 && <CircularProgress size="sm" />}
        </div>
        <SubmitGenerateButton />
      </Stack>
    </div>
  );
}
