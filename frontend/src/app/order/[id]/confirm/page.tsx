'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Package } from 'lucide-react';

export default function OrderConfirmPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id as string;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Success icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée ! 🎉</h1>
                <p className="text-gray-500 mb-6">
                    Votre commande a bien été enregistrée et sera traitée dans les plus brefs délais.
                </p>

                {/* Order number */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Numéro de commande</p>
                    <p className="font-mono text-sm font-medium text-gray-800 break-all">
                        {orderId ?? 'N/A'}
                    </p>
                </div>

                {/* Product summary */}
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 text-left">
                    <Package className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Votre impression est en file d&apos;attente</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Statut : <span className="font-medium text-orange-600">En attente de paiement</span>
                        </p>
                    </div>
                </div>

                {/* Email confirmation */}
                <p className="text-sm text-gray-500 mb-8">
                    📧 Vous recevrez un email de confirmation avec les détails de votre commande.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Retour à l&apos;accueil
                    </button>
                    <button
                        onClick={() => router.push('/editor')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                    >
                        Créer une autre impression
                    </button>
                </div>
            </div>
        </div>
    );
}
