// app/profile/ProfileFormFields.tsx
import { Control, useController } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProfileFormData } from '@/app/(dashboard)/profile/schema';

interface ProfileFormFieldsProps {
    control: Control<ProfileFormData>;
}

export default function ProfileFormFields({ control }: ProfileFormFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* NOME */}
            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Nome Completo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* EMAIL */}
            <FormField
                control={control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* CPF */}
            <FormField
                control={control}
                name="cpf"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>CPF (Opcional)</FormLabel>
                        <FormControl>
                            {/* Garante que o valor inicial seja string vazia para controle */}
                            <Input placeholder="xxx.xxx.xxx-xx" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* SENHA */}
            <FormField
                control={control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nova Senha (Opcional)</FormLabel>
                        <FormControl>
                            {/* O valor é sempre limpo (string vazia) para não carregar a hash */}
                            <Input type="password" placeholder="Deixe em branco para não alterar" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}