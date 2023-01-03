import { getParsedCoverInfo, getParsedProductInfo } from '@/src/helpers/cover'
import { getSubgraphData } from '@/src/services/subgraph'

export async function getCoverData (networkId, coverKey) {
  const data = await getSubgraphData(
    networkId,
    `{
  cover (id: "${coverKey}") {
    id
    coverKey
    supportsProducts
    ipfsHash
    ipfsData
    products {
      id
      productKey
      coverKey
      ipfsHash
      ipfsData
    }
  }
}`
  )

  if (!data.cover) return null

  const products = await Promise.all(
    data.cover.products.map(async (product) => ({
      id: product.id,
      productKey: product.productKey,
      coverKey: product.coverKey,
      ipfsHash: product.ipfsHash,
      ipfsData: product.ipfsData,
      infoObj: await getParsedProductInfo(product.ipfsData, product.ipfsHash)
    }))
  )

  return {
    id: data.cover.id,
    coverKey: data.cover.coverKey,
    supportsProducts: data.cover.supportsProducts,
    ipfsHash: data.cover.ipfsHash,
    ipfsData: data.cover.ipfsData,
    infoObj: await getParsedCoverInfo(data.cover.ipfsData, data.cover.ipfsHash),
    products: products
  }
}

export async function getCoverProductData (networkId, coverKey, productKey) {
  const data = await getSubgraphData(
    networkId,
    `{
  product (id: "${coverKey}-${productKey}") {
    id
    coverKey
    productKey
    ipfsHash
    ipfsData
    cover {
      id
      supportsProducts
      coverKey
      ipfsHash
      ipfsData
    }
  }
}`
  )

  if (!data?.product) return null

  return {
    id: data.product.id,
    coverKey: data.product.coverKey,
    productKey: data.product.productKey,
    ipfsHash: data.product.ipfsHash,
    ipfsData: data.product.ipfsData,
    infoObj: await getParsedProductInfo(
      data.product.ipfsData,
      data.product.ipfsHash
    ),
    cover: {
      id: data.product.cover.id,
      supportsProducts: data.product.cover.supportsProducts,
      coverKey: data.product.cover.coverKey,
      ipfsHash: data.product.cover.ipfsHash,
      ipfsData: data.product.cover.ipfsData,
      infoObj: await getParsedCoverInfo(
        data.product.cover.ipfsData,
        data.product.cover.ipfsHash
      )
    }
  }
}
