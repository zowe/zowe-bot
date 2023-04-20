/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { CommonBot } from '../../../src/CommonBot';
import { IChatToolType, IBotOption } from '../../../src/types';

export class MockCommonBot {
  public static MSTEAMS_BOT: CommonBot = (() => {
    const bot: CommonBot = jest.createMockFromModule('../../../src/CommonBot');
    bot.getOption = () => {
      return {
        chatTool: {
          type: IChatToolType.MSTEAMS,
          option: {
            botId: 'dummybot',
          },
        },
      } as IBotOption;
    };
    return bot;
  })();

  public static MATTERMOST_BOT: CommonBot = (() => {
    const bot: CommonBot = jest.createMockFromModule('../../../src/CommonBot');
    bot.getOption = () => {
      return {
        chatTool: {
          type: IChatToolType.MATTERMOST,
        },
      } as IBotOption;
    };
    return bot;
  })();

  public static SLACK_BOT: CommonBot = (() => {
    const bot: CommonBot = jest.createMockFromModule('../../../src/CommonBot');
    bot.getOption = () => {
      return {
        chatTool: {
          type: IChatToolType.SLACK,
          option: {
            socketMode: true,
            appToken: 'mock_apptoken',
            token: 'mock_token',
          },
        },
      } as IBotOption;
    };
    return bot;
  })();
}
