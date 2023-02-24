/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import { MattermostClient } from '../../../src/plugins/mattermost/MattermostClient';
import { MattermostMiddleware } from '../../../src/plugins/mattermost/MattermostMiddleware';
import { IMessageType } from '../../../src/types';

describe('Direct Message Tests', () => {
  it('Mattermost DirectMessage', () => {
    const middleware = {} as MattermostMiddleware;
    const client = new MattermostClient(middleware, {
      protocol: 'https',
      tlsCertificate: test.ca,
    } as IMattermostOption);

    middleware.sendDirectMessage({}, [
      {
        type: IMessageType.PLAIN_TEXT,
        message: 'Test DM',
      },
    ]);
  });

  it('Slack DirectMessage', () => {});

  it('MSTeams DirectMessage', () => {});
});
