'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/editorStore';
import { AlertCircle, Loader2, ShoppingCart, Package } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const checkoutSchema = z.object({
  shippingFirstName: z.string().min(1, 'Prénom requis'),
  shippingLastName: z.string().min(1, 'Nom requis'),
  shippingAddress: z.string().min(5, 'Adresse requise'),
  shippingCity: z.string().min(1, 'Ville requise'),
  shippingPostalCode: z.string().min(4, 'Code postal requis'),
  shippingPhone: z.string().min(8, 'Téléphone : 8 chiffres minimum'),
  guestEmail: z.string().email('Email invalide').optional().or(z.literal('')),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    canCheckout,
    selectedTemplate,
    selectedSize,
    selectedFrame,
    getDesignJson,
    layers,
  } = useEditorStore();

  useEffect(() => {
    if (!canCheckout()) router.push('/editor');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ resolver: zodResolver(checkoutSchema) });

  const sizePrice = parseFloat((selectedSize as any)?.price_delta || 0);
  const framePrice = parseFloat((selectedFrame as any)?.price_delta || 0);
  const total = (sizePrice + framePrice).toFixed(2);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitError(null);
    try {
      const previewUrl = `preview_placeholder`;
      const body = {
        productSizeId: (selectedSize as any)?.id ?? 'unknown',
        frameOptionId: (selectedFrame as any)?.id ?? undefined,
        designJson: getDesignJson(),
        previewUrl,
        ...data,
      };
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
      const res = await fetch(`${API_BASE}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Erreur lors de la commande');
      }
      const result = await res.json();
      router.push(`/order/${result.orderId}/confirm`);
    } catch (err: any) {
      setSubmitError(err.message || 'Une erreur est survenue');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const errorClass = 'text-xs text-red-600 mt-1';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Finaliser la commande
          </h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Récapitulatif */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Récapitulatif
              </h2>
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Aperçu du design</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Template</span>
                  <span className="font-medium">{selectedTemplate?.name || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taille</span>
                  <span className="font-medium">{(selectedSize as any)?.label || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cadre</span>
                  <span className="font-medium">
                    {selectedFrame ? `${(selectedFrame as any).label} +${framePrice} TND` : 'Sans cadre'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Photos</span>
                  <span className="font-medium">{layers.filter((l) => l.type === 'image').length} photo(s)</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-green-700">{total} TND</span>
                </div>
              </div>
            </div>
          </div>
          {/* Formulaire */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="font-bold text-gray-800 mb-2">Adresse de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Prénom *</label>
                  <input {...register('shippingFirstName')} className={inputClass} placeholder="Ahmed" />
                  {errors.shippingFirstName && <p className={errorClass}>{errors.shippingFirstName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Nom *</label>
                  <input {...register('shippingLastName')} className={inputClass} placeholder="Ben Ali" />
                  {errors.shippingLastName && <p className={errorClass}>{errors.shippingLastName.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Adresse *</label>
                <input {...register('shippingAddress')} className={inputClass} placeholder="12 Rue Habib Bourguiba" />
                {errors.shippingAddress && <p className={errorClass}>{errors.shippingAddress.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Ville *</label>
                  <input {...register('shippingCity')} className={inputClass} placeholder="Sfax" />
                  {errors.shippingCity && <p className={errorClass}>{errors.shippingCity.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Code postal *</label>
                  <input {...register('shippingPostalCode')} className={inputClass} placeholder="3000" />
                  {errors.shippingPostalCode && <p className={errorClass}>{errors.shippingPostalCode.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Téléphone *</label>
                <input {...register('shippingPhone')} className={inputClass} placeholder="21234567" />
                {errors.shippingPhone && <p className={errorClass}>{errors.shippingPhone.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Email (si non connecté)</label>
                <input {...register('guestEmail')} className={inputClass} type="email" placeholder="votre@email.com" />
                {errors.guestEmail && <p className={errorClass}>{errors.guestEmail.message}</p>}
              </div>
              {submitError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Commander — {total} TND</>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
