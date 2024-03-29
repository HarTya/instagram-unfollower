export default function Eye({
    close = true
}) {
    return (
        <svg
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
        >
            {close
                ?
                <>
                    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' />
                    <path d='M14.12 14.12a3 3 0 1 1-4.24-4.24' />
                    <path d='m1 1 22 22' />
                    <path d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' />
                </>
                :
                <>
                    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                    <path d='M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6z' />
                </>
            }
        </svg>
    )
}