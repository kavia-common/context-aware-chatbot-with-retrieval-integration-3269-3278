#!/bin/bash
cd /home/kavia/workspace/code-generation/context-aware-chatbot-with-retrieval-integration-3269-3278/chat_bot_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

