import { useNetwork } from "@/src/context/Network";
import { getSubgraphData } from "@/src/services/subgraph";
import { useState, useEffect } from "react";

export const useRecentVotes = ({
  coverKey,
  productKey,
  incidentDate,
  limit,
  page,
}) => {
  const [data, setData] = useState({
    votes: [],
    blockNumber: null,
  });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { networkId } = useNetwork();

  useEffect(() => {
    let ignore = false;

    if (!coverKey || !incidentDate) {
      return;
    }

    const query = `
    {
      _meta {
        block {
          number
        }
      }
      votes(
        skip: ${limit * (page - 1)}
        first: ${limit} 
        orderBy: createdAtTimestamp
        orderDirection: desc
        where: {
          coverKey:"${coverKey}"
          productKey:"${productKey}"
          incidentDate: "${incidentDate}"
      }) {
        id
        createdAtTimestamp
        voteType
        witness
        stake
        transaction {
          id
          timestamp
        }
      }
    }        
    `;

    setLoading(true);
    getSubgraphData(networkId, query)
      .then((_data) => {
        if (ignore) return;

        if (!_data) return;

        const isLastPage =
          _data.votes.length === 0 || _data.votes.length < limit;

        if (isLastPage) {
          setHasMore(false);
        }

        setData((prev) => ({
          blockNumber: _data._meta.block.number,
          votes: [...prev.votes, ..._data.votes],
        }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [coverKey, incidentDate, limit, networkId, page, productKey]);

  return {
    data: {
      blockNumber: data.blockNumber,
      transactions: data?.votes || [],
    },
    loading,
    hasMore,
  };
};
