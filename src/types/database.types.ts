export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            goals: {
                Row: {
                    created_at: string
                    current_amount: number
                    deadline: string
                    id: string
                    product_id: string
                    status: string
                    target_amount: number
                    title: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    current_amount?: number
                    deadline: string
                    id?: string
                    product_id: string
                    status?: string
                    target_amount: number
                    title: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    current_amount?: number
                    deadline?: string
                    id?: string
                    product_id?: string
                    status?: string
                    target_amount?: number
                    title?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "goals_product_id_fkey"
                        columns: ["product_id"]
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "goals_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            products: {
                Row: {
                    category: string
                    created_at: string
                    description: string | null
                    id: string
                    image_url: string | null
                    merchant_id: string
                    name: string
                    price: number
                    stock: number
                }
                Insert: {
                    category: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    merchant_id: string
                    name: string
                    price: number
                    stock?: number
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    merchant_id?: string
                    name?: string
                    price?: number
                    stock?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "products_merchant_id_fkey"
                        columns: ["merchant_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    brela_certificate_number: string | null
                    business_license_number: string | null
                    business_name: string | null
                    created_at: string
                    district: string | null
                    email: string
                    full_name: string | null
                    id: string
                    map_location: Json | null
                    phone_number: string | null
                    region: string | null
                    role: string
                    shop_description: string | null
                    tin_number: string | null
                    ward: string | null
                    gender: string | null
                    date_of_birth: string | null
                    interests: string[] | null
                    delivery_location: string | null
                    onboarding_step: string
                }
                Insert: {
                    avatar_url?: string | null
                    brela_certificate_number?: string | null
                    business_license_number?: string | null
                    business_name?: string | null
                    created_at?: string
                    district?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    map_location?: Json | null
                    phone_number?: string | null
                    region?: string | null
                    role?: string
                    shop_description?: string | null
                    tin_number?: string | null
                    ward?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    interests?: string[] | null
                    delivery_location?: string | null
                    onboarding_step?: string
                }
                Update: {
                    avatar_url?: string | null
                    brela_certificate_number?: string | null
                    business_license_number?: string | null
                    business_name?: string | null
                    created_at?: string
                    district?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    map_location?: Json | null
                    phone_number?: string | null
                    region?: string | null
                    role?: string
                    shop_description?: string | null
                    tin_number?: string | null
                    ward?: string | null
                    gender?: string | null
                    date_of_birth?: string | null
                    interests?: string[] | null
                    delivery_location?: string | null
                    onboarding_step?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            transactions: {
                Row: {
                    amount: number
                    created_at: string
                    goal_id: string
                    id: string
                    payment_method: string
                    reference_id: string | null
                    status: string
                    type: string
                    user_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    goal_id: string
                    id?: string
                    payment_method: string
                    reference_id?: string | null
                    status?: string
                    type: string
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    goal_id?: string
                    id?: string
                    payment_method?: string
                    reference_id?: string | null
                    status?: string
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_goal_id_fkey"
                        columns: ["goal_id"]
                        referencedRelation: "goals"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            follows: {
                Row: {
                    created_at: string
                    follower_id: string
                    following_id: string
                    id: string
                }
                Insert: {
                    created_at?: string
                    follower_id: string
                    following_id: string
                    id?: string
                }
                Update: {
                    created_at?: string
                    follower_id?: string
                    following_id?: string
                    id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "follows_follower_id_fkey"
                        columns: ["follower_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "follows_following_id_fkey"
                        columns: ["following_id"]
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
