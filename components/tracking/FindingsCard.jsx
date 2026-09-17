import React from 'react';

import {
  View,
  Text,
} from 'react-native';

import {
  FileText,
  Package,
  Wrench,
} from 'lucide-react-native';

/* ================================================================
   COLORS
================================================================ */

const PRIMARY =
  '#C1272D';

const MUTED =
  '#8E8E93';

const BORDER =
  '#C6C6C8';

const SUCCESS =
  '#16A34A';

/* ================================================================
   HELPERS
================================================================ */

/**
 * Convert any supported numeric value into a safe number.
 */
function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  const parsed =
    Number(
      value,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

/**
 * Normalize the parts/products collection.
 *
 * The AutoCare data may expose a finding's materials as:
 *
 * - parts
 * - products
 */
function getFindingParts(
  finding,
) {
  if (
    Array.isArray(
      finding?.parts,
    )
  ) {
    return finding.parts;
  }

  if (
    Array.isArray(
      finding?.products,
    )
  ) {
    return finding.products;
  }

  return [];
}

/**
 * Return a human-readable part name.
 */
function getPartName(
  part,
) {
  return (
    part?.partName ||
    part?.name ||
    part?.productName ||
    part?.title ||
    'Part'
  );
}

/**
 * Return the quantity.
 */
function getQuantity(
  part,
) {
  const quantity =
    toNumber(
      part?.quantity,
    );

  return quantity >
    0
    ? quantity
    : 1;
}

/**
 * Calculate the displayed amount for a finding part.
 *
 * Supported API shapes:
 *
 * - totalPrice already contains the line total
 * - priceAtTime is the unit price
 * - price is the unit price
 *
 * PMS parts are treated as included.
 */
function getPartAmount(
  part,
) {
  if (
    part?.isPms
  ) {
    return 0;
  }

  const explicitTotal =
    part?.totalPrice;

  if (
    explicitTotal !==
      null &&
    explicitTotal !==
      undefined &&
    explicitTotal !==
      ''
  ) {
    const total =
      toNumber(
        explicitTotal,
      );

    if (
      Number.isFinite(
        total,
      )
    ) {
      return total;
    }
  }

  const unitPrice =
    toNumber(
      part?.priceAtTime ??
        part?.price ??
        part?.unitPrice,
    );

  return (
    unitPrice *
    getQuantity(
      part,
    )
  );
}

/**
 * Currency formatting.
 */
function formatCurrency(
  value,
) {
  const amount =
    toNumber(
      value,
    );

  return `₱${amount.toFixed(
    2,
  )}`;
}

/**
 * Format a quantity without unnecessary decimals.
 */
function formatQuantity(
  value,
) {
  const quantity =
    getQuantity(
      {
        quantity:
          value,
      },
    );

  if (
    Number.isInteger(
      quantity,
    )
  ) {
    return String(
      quantity,
    );
  }

  return String(
    quantity,
  );
}

/* ================================================================
   FINDING PART ROW
================================================================ */

function FindingPartRow({
  part,
}) {
  const isPms =
    Boolean(
      part?.isPms,
    );

  const quantity =
    getQuantity(
      part,
    );

  const partName =
    getPartName(
      part,
    );

  const amount =
    getPartAmount(
      part,
    );

  return (
    <View
      className="
        flex-row
        items-center
        justify-between
        gap-3
        border-t
        border-border
        py-3
      "
    >
      <View
        className="
          min-w-0
          flex-1
          flex-row
          items-center
          gap-2.5
        "
      >
        <View
          className="
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-muted
          "
        >
          <Package
            size={
              14
            }
            color={
              MUTED
            }
            strokeWidth={
              2
            }
          />
        </View>

        <View
          className="
            min-w-0
            flex-1
          "
        >
          <Text
            numberOfLines={
              2
            }
            className="
              text-sm
              font-medium
              text-foreground
            "
          >
            {formatQuantity(
              quantity,
            )}
            x{' '}
            {partName}
          </Text>

          {isPms && (
            <View
              className="
                mt-1
                self-start
                rounded-full
                bg-green-500/10
                px-2
                py-0.5
              "
            >
              <Text
                className="
                  text-[10px]
                  font-semibold
                  text-green-700
                "
              >
                Included in PMS
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text
        className="
          shrink-0
          text-sm
          font-semibold
          text-foreground
        "
      >
        {isPms
          ? 'Included'
          : formatCurrency(
              amount,
            )}
      </Text>
    </View>
  );
}

/* ================================================================
   FINDING CARD
================================================================ */

function FindingItem({
  finding,
  index,
}) {
  const parts =
    getFindingParts(
      finding,
    );

  return (
    <View
      className="
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-background
      "
    >
      {/* ----------------------------------------------------------
          FINDING HEADER
      ----------------------------------------------------------- */}

      <View
        className="
          flex-row
          items-start
          gap-3
          px-4
          py-4
        "
      >
        <View
          className="
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-primary/10
          "
        >
          <FileText
            size={
              19
            }
            color={
              PRIMARY
            }
            strokeWidth={
              2
            }
          />
        </View>

        <View
          className="
            min-w-0
            flex-1
          "
        >
          <Text
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Finding{' '}
            {index + 1}
          </Text>

          <Text
            className="
              mt-1
              text-base
              font-semibold
              leading-6
              text-foreground
            "
          >
            {String(
              finding?.description ||
                finding?.title ||
                'Diagnostic finding',
            )}
          </Text>
        </View>
      </View>

      {/* ----------------------------------------------------------
          PARTS / PRODUCTS
      ----------------------------------------------------------- */}

      {parts.length >
        0 && (
        <View
          className="
            px-4
            pb-3
          "
        >
          <View
            className="
              mb-1
              flex-row
              items-center
              gap-2
            "
          >
            <Package
              size={
                14
              }
              color={
                MUTED
              }
              strokeWidth={
                2
              }
            />

            <Text
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Parts & Supplies
            </Text>
          </View>

          <View
            className="
              rounded-lg
              bg-card
              px-3
            "
          >
            {parts.map(
              (
                part,
                partIndex,
              ) => (
                <FindingPartRow
                  key={
                    part?.id ||
                    `${finding?.id || index}-part-${partIndex}`
                  }
                  part={
                    part
                  }
                />
              ),
            )}
          </View>
        </View>
      )}

      {/* ----------------------------------------------------------
          FINDING FOOTER
      ----------------------------------------------------------- */}

      <View
        className="
          flex-row
          items-center
          gap-2
          border-t
          border-border
          px-4
          py-3
        "
      >
        <Wrench
          size={
            13
          }
          color={
            MUTED
          }
          strokeWidth={
            2
          }
        />

        <Text
          className="
            flex-1
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          Recorded during vehicle inspection
        </Text>

        {parts.length >
          0 && (
          <Text
            className="
              shrink-0
              text-[10px]
              font-semibold
              text-muted-foreground
            "
          >
            {parts.length}{' '}
            {parts.length ===
            1
              ? 'part'
              : 'parts'}
          </Text>
        )}
      </View>
    </View>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

export default function FindingsCard({
  findings = [],
}) {
  /*
   * Only render the card when actual findings exist.
   */
  if (
    !Array.isArray(
      findings,
    ) ||
    findings.length ===
      0
  ) {
    return null;
  }

  const totalParts =
    findings.reduce(
      (
        total,
        finding,
      ) =>
        total +
        getFindingParts(
          finding,
        ).length,
      0,
    );

  return (
    <View
      className="
        mb-6
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >
      {/* ==========================================================
          HEADER
      =========================================================== */}

      <View
        className="
          flex-row
          items-center
          justify-between
          gap-3
          border-b
          border-border
          px-4
          py-4
        "
      >
        <View
          className="
            min-w-0
            flex-1
            flex-row
            items-center
            gap-3
          "
        >
          <View
            className="
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary/10
            "
          >
            <FileText
              size={
                19
              }
              color={
                PRIMARY
              }
              strokeWidth={
                2
              }
            />
          </View>

          <View
            className="
              min-w-0
              flex-1
            "
          >
            <Text
              className="
                text-lg
                font-semibold
                text-foreground
              "
            >
              Findings
            </Text>

            <Text
              className="
                mt-0.5
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              Diagnostic findings recorded for your vehicle
            </Text>
          </View>
        </View>

        <View
          className="
            shrink-0
            rounded-full
            bg-primary/10
            px-3
            py-1.5
          "
        >
          <Text
            className="
              text-xs
              font-semibold
              text-primary
            "
          >
            {findings.length}{' '}
            {findings.length ===
            1
              ? 'Finding'
              : 'Findings'}
          </Text>
        </View>
      </View>

      {/* ==========================================================
          FINDINGS LIST
      =========================================================== */}

      <View
        className="
          gap-3
          p-4
        "
      >
        {findings.map(
          (
            finding,
            index,
          ) => (
            <FindingItem
              key={
                finding?.id ||
                `finding-${index}`
              }
              finding={
                finding
              }
              index={
                index
              }
            />
          ),
        )}
      </View>

      {/* ==========================================================
          SUMMARY FOOTER
      =========================================================== */}

      <View
        className="
          flex-row
          items-center
          justify-between
          gap-3
          border-t
          border-border
          px-4
          py-3
        "
      >
        <Text
          className="
            text-xs
            text-muted-foreground
          "
        >
          Inspection findings
        </Text>

        {totalParts >
          0 && (
          <Text
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            {totalParts}{' '}
            {totalParts ===
            1
              ? 'part'
              : 'parts'}{' '}
            recorded
          </Text>
        )}
      </View>
    </View>
  );
}