import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Product, currency, seasons } from "@/data/catalog";
import { AddToCart } from "@/components/add-to-cart";
export function ProductCard({product}:{product:Product}){return <article className="product-card"><Link href={`/san-pham/${product.slug}`} className="product-media" aria-label={`Chi tiết ${product.name}`}><Image src={product.image} alt={`Minh hoạ thức uống ${product.name}, màu sắc theo nguyên liệu ${product.ingredients.map(x=>x.name).join(', ')}`} width={640} height={720} loading="lazy"/>{product.badge&&<span className="product-badge">{product.badge}</span>}<span className="product-go"><ArrowUpRight size={22}/></span></Link><div className="product-body"><span className="product-category">{seasons[product.season].label} · {product.method}</span><Link href={`/san-pham/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.tagline}</p><div className="product-bottom"><strong>{currency(product.price)}</strong><AddToCart id={product.id}/></div></div></article>}
