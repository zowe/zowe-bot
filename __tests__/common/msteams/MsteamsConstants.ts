/*
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

export class MsteamsConstants {
  public static EMPTY_ADAPTIVE_CARD: Record<string, any> = {
    type: 'AdaptiveCard',
    fallbackText: '',
    msteams: {
      width: 'Full',
    },
    body: [],
    actions: [],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
  };
}
