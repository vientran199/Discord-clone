"use client";

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import qs from 'query-string'
import { Plus, Smile } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>;
    name: string;
    type: 'channel' | 'conversation';
}

const formSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty'),
});

export const ChatInput = ({
    name,
    type,
    apiUrl,
    query,
}: ChatInputProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Submitting message:', values);
        try {
            const url = qs.stringifyUrl({
                url: apiUrl,
                query: {
                    ...query,
                }
            })

            await axios.post(url, values)
        } catch (error) {
            console.error(error);
        } finally {

        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center gap-2 p-4 bg-white dark:bg-[#313338] border-t border-gray-200 dark:border-gray-700"
            >
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl className='w-full'>
                                <div className='relative p-4 pb-6'>
                                    <button
                                        type='button'
                                        onClick={() => { }}
                                        className='absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center'
                                    >
                                        <Plus className='h-4 w-4 text-white dark:text-[#313338]' />
                                    </button>

                                    <Input
                                        disabled={isLoading}
                                        className='px-14 py-6 bg-zinc-200/9 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200'
                                        placeholder={` Message ${type === 'channel' ? `#${name}` : name}`}
                                        {...field}
                                        onChange={field.onChange}
                                    />
                                    <div className='absolute top-7 right-8'>
                                        <Smile />
                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )

}