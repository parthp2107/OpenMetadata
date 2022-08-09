import { Dropdown } from 'antd';
import classNames from 'classnames';
import { isString } from 'lodash';
import { ExtraInfo } from 'Models';
import React, { useState } from 'react';
import { Table } from '../../../generated/entity/data/table';
import { TagLabel } from '../../../generated/type/tagLabel';
import SVGIcons, { Icons } from '../../../utils/SvgUtils';
import { Button } from '../../buttons/Button/Button';
import OwnerWidgetWrapper from '../OwnerWidget/OwnerWidgetWrapper.component';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import TierCard from '../TierCard/TierCard';

export interface GetInfoElementsProps {
  data: ExtraInfo;
  updateOwner?: (value: Table['owner']) => void;
  tier?: TagLabel;
  currentTier?: string;
  updateTier?: (value: string) => void;
}

const EntitySummaryDetails = ({
  data,
  tier,
  updateOwner,
  updateTier,
}: GetInfoElementsProps) => {
  let retVal = <></>;
  const displayVal = data.placeholderText || data.value;
  const [show, setshow] = useState(false);

  switch (data.key) {
    case 'Owner':
      {
        retVal =
          displayVal && displayVal !== '--' ? (
            isString(displayVal) ? (
              <div className="tw-inline-block tw-mr-2">
                <ProfilePicture
                  displayName={displayVal}
                  id=""
                  name={data.profileName || ''}
                  width={data.avatarWidth || '20'}
                />
              </div>
            ) : (
              <></>
            )
          ) : (
            <>
              No Owner
              <span
                data-testid={`edit-${data.key}-icon`}
                onClick={() => setshow(!show)}>
                {updateOwner ? (
                  <SVGIcons
                    alt="edit"
                    icon={Icons.EDIT}
                    title="Edit"
                    width="15px"
                  />
                ) : null}
              </span>
            </>
          );
      }

      break;
    case 'Tier':
      {
        retVal =
          !displayVal || displayVal === '--' ? (
            <>
              No Tier
              <Dropdown
                overlay={
                  <TierCard
                    currentTier={tier?.tagFQN}
                    updateTier={updateTier}
                  />
                }
                trigger={['click']}>
                <span
                  data-testid={`edit-${data.key}-icon`}
                  style={{ marginLeft: '5px' }}>
                  {updateTier ? (
                    <SVGIcons
                      alt="edit"
                      icon={Icons.EDIT}
                      title="Edit"
                      width="15px"
                    />
                  ) : null}
                </span>
              </Dropdown>
            </>
          ) : (
            <></>
          );
      }

      break;
    default:
      {
        retVal = (
          <>
            {data.key
              ? displayVal
                ? data.showLabel
                  ? `${data.key}: `
                  : null
                : `No ${data.key}`
              : null}
          </>
        );
      }

      break;
  }

  return (
    <span>
      <span className="tw-text-grey-muted">{retVal}</span>
      {displayVal ? (
        <span>
          {data.isLink ? (
            <>
              <a
                data-testid="owner-link"
                href={data.value as string}
                rel="noopener noreferrer"
                target={data.openInNewTab ? '_blank' : '_self'}>
                <>
                  <span
                    className={classNames(
                      'tw-mr-1 tw-inline-block tw-truncate link-text tw-align-middle',
                      {
                        'tw-w-52': (displayVal as string).length > 32,
                      }
                    )}>
                    {displayVal}
                  </span>

                  {data.openInNewTab && (
                    <SVGIcons
                      alt="external-link"
                      className="tw-align-middle"
                      icon="external-link"
                      width="16px"
                    />
                  )}
                </>
              </a>
              <span
                data-testid={`edit-${data.key}-icon`}
                style={{ marginLeft: '5px' }}
                onClick={() => setshow(true)}>
                <SVGIcons
                  alt="edit"
                  icon={Icons.EDIT}
                  title="Edit"
                  width="15px"
                />
              </span>
            </>
          ) : (
            <>
              {data.key === 'Owner' ? (
                <>
                  <span
                    className={classNames(
                      'tw-mr-1 tw-inline-block tw-truncate tw-align-middle',
                      { 'tw-w-52': (displayVal as string).length > 32 }
                    )}
                    data-testid="owner-name"
                    title={displayVal as string}>
                    <Button
                      data-testid="owner-dropdown"
                      size="custom"
                      theme="primary"
                      variant="text">
                      {displayVal}
                    </Button>
                    <span
                      data-testid={`edit-${data.key}-icon`}
                      style={{ marginLeft: '5px' }}
                      onClick={() => setshow(true)}>
                      {updateOwner ? (
                        <SVGIcons
                          alt="edit"
                          icon={Icons.EDIT}
                          title="Edit"
                          width="15px"
                        />
                      ) : null}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  {data.key === 'Tier' ? (
                    <>
                      <span
                        className={classNames(
                          'tw-mr-1 tw-inline-block tw-truncate tw-align-middle',
                          { 'tw-w-52': (displayVal as string).length > 32 }
                        )}
                        data-testid="tier-name"
                        title={displayVal as string}>
                        <Button
                          data-testid="tier-dropdown"
                          size="custom"
                          theme="primary"
                          variant="text">
                          {displayVal}
                        </Button>
                        <span>
                          <Dropdown
                            overlay={
                              <TierCard
                                currentTier={tier?.tagFQN}
                                updateTier={updateTier}
                              />
                            }
                            trigger={['click']}>
                            <span
                              data-testid={`edit-${data.key}-icon`}
                              style={{ marginLeft: '5px' }}>
                              {updateTier ? (
                                <SVGIcons
                                  alt="edit"
                                  icon={Icons.EDIT}
                                  title="Edit"
                                  width="15px"
                                />
                              ) : null}
                            </span>
                          </Dropdown>
                        </span>
                      </span>
                    </>
                  ) : (
                    <span>{displayVal}</span>
                  )}
                </>
              )}
            </>
          )}
        </span>
      ) : null}
      <OwnerWidgetWrapper
        hideWidget={() => setshow(false)}
        updateUser={updateOwner}
        visible={show}
      />
    </span>
  );
};

export default EntitySummaryDetails;
