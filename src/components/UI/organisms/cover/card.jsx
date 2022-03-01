import { Divider } from "@/components/UI/atoms/divider";
import { ProgressBar } from "@/components/UI/atoms/progress-bar";
import { OutlinedCard } from "@/components/UI/molecules/outlined-card";
import { getCoverImgSrc } from "@/src/helpers/cover";
import { useFetchCoverStats } from "@/src/hooks/useFetchCoverStats";
import { formatCurrency } from "@/utils/formatter/currency";
import { convertFromUnits } from "@/utils/bn";
import { formatPercent } from "@/utils/formatter/percent";
import { MULTIPLIER } from "@/src/config/constants";

export const CoverCard = ({ details }) => {
  const { projectName, key, ipfsData } = details;
  const { data } = useFetchCoverStats({ coverKey: key });
  const imgSrc = getCoverImgSrc({ key });

  return (
    <OutlinedCard className="bg-white p-6" type="link">
      <div className="flex justify-between">
        <div>
          <div className="">
            <img
              src={imgSrc}
              alt={projectName}
              className="inline-block max-w-full w-14 lg:w-18"
            />
          </div>
          <h4 className="text-h4 font-sora font-semibold uppercase mt-4">
            {projectName}
          </h4>
          <div className="text-h7 lg:text-sm text-7398C0 uppercase  mt-1 lg:mt-2">
            Cover fee: {formatPercent(ipfsData.pricingFloor / MULTIPLIER)}-
            {formatPercent(ipfsData.pricingCeiling / MULTIPLIER)}
          </div>
        </div>
        <div>
          {/* <Badge className="text-h7 lg:text-sm text-21AD8C border rounded-3xl">
            APR: {''}%
          </Badge> */}
        </div>
      </div>

      {/* Divider */}
      <Divider className="mb-4 lg:mb-8" />

      {/* Stats */}
      <div className="flex justify-between text-h7 lg:text-sm px-1">
        <span className="uppercase text-h7 lg:text-sm">utilization Ratio</span>
        <span className="font-semibold text-right text-h7 lg:text-sm ">
          {formatPercent(data.utilization)}
        </span>
      </div>
      <div className="mt-2 mb-4">
        <ProgressBar value={data.utilization} />
      </div>
      <div className="flex justify-between text-h7 lg:text-sm px-1">
        <span
          className=""
          title={
            formatCurrency(convertFromUnits(data.protection).toString()).long
          }
        >
          Protection:{" "}
          {formatCurrency(convertFromUnits(data.protection).toString()).short}
        </span>

        <span
          className="text-right"
          title={
            formatCurrency(convertFromUnits(data.liquidity).toString()).long
          }
        >
          Liquidity:{" "}
          {formatCurrency(convertFromUnits(data.liquidity).toString()).short}
        </span>
      </div>
    </OutlinedCard>
  );
};
