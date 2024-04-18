import { GraphQLError } from 'graphql';

export class BadUserInputError extends GraphQLError {
    // eslint-disable-next-line unicorn/custom-error-definition
    constructor(message: string, exception?: Error) {
        super(message, {
            originalError: exception,
            extensions: {
                code: 'BAD_USER_INPUT',
            },
        });
    }
}
